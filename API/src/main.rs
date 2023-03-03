use actix_cors::Cors;
use actix_web::middleware::Logger;
use actix_web::{web, App, HttpServer};
use diesel::r2d2::ConnectionManager;
use diesel::{r2d2, PgConnection};
use routes::nn;
use std::env;
use std::path::Path;

pub struct ModelDir(pub String);
pub struct DataDir(pub String);

mod models;
mod routes;
mod services;
mod util;

extern crate emoji_logger;
#[macro_use]
extern crate log;

const TENSOR_FLOW_LOGGING_FLAG: &str = "TF_CPP_MIN_LOG_LEVEL";

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    emoji_logger::init_custom_env("LOG_LEVEL");
    let endpoint = format!("0.0.0.0:{}", 8080);

    env::set_var(TENSOR_FLOW_LOGGING_FLAG, "2");

    let Ok(model_dir) = env::var("MODEL_DIR") else {
        error!("MODEL_DIR environment variable not set");
        std::process::exit(1);
    };

    if !Path::new(&model_dir).exists() {
        error!("MODEL_DIR set but {model_dir} doesnt exist");
        std::process::exit(1);
    }

    let Ok(data_dir) = env::var("DATA_DIR") else {
        error!("DATA_DIR environment variable not set");
        std::process::exit(1);
    };

    let Ok(database_url) = env::var("DATABASE_URL") else {
        error!("DATABASE_URL environment variable not set");
        std::process::exit(1);
    };

    let manager = ConnectionManager::<PgConnection>::new(&database_url);

    let pool = r2d2::Pool::builder()
        .max_size(5)
        .build(manager)
        .expect("Could not connect to database!");

    let redis_client = match env::var("REDIS_URL") {
        Ok(url) => redis::Client::open(url)
            .map_err(|error| warn!("REDIS_URL environment variable not set, we will not cache tensorflow model responses. Error {error}"))
            .ok(),
        Err(error) => {
            warn!("REDIS_URL environment variable not set, we will not cache tensorflow model responses. Error: {error}");
            None
        }
    };

    info!("Running server at {endpoint}");
    info!("Models directory: {model_dir}");
    info!("Data directory: {data_dir}");
    if redis_client.is_some() {
        info!("Redis is running! :)")
    }

    let history_pool = pool.clone();
    let history_model_dir = model_dir.clone();

    let missed_games_pool = pool.clone();
    let missed_games_model_dir = model_dir.clone();
    let missed_games_data_dir = data_dir.clone();

    actix_rt::spawn(async move {
        services::missed_games_service::run(
            missed_games_pool,
            missed_games_model_dir,
            missed_games_data_dir,
        )
        .await
    });
    actix_rt::spawn(async move {
        services::history_service::run(history_pool, history_model_dir).await
    });

    HttpServer::new(move || {
        App::new()
            .app_data(web::Data::new(ModelDir(model_dir.clone())))
            .app_data(web::Data::new(DataDir(data_dir.clone())))
            .app_data(web::Data::new(pool.clone()))
            .app_data(web::Data::new(redis_client.clone()))
            .wrap(Cors::permissive())
            .wrap(Logger::default())
            .service(
                web::scope("/sports")
                    .route("/predict/all", web::get().to(nn::predict_all))
                    .route("/games", web::get().to(nn::games))
                    .route("/history", web::get().to(nn::history))
                    .route("/history/dates", web::get().to(nn::history_dates))
                    .route("/model/accuracy", web::get().to(nn::model_accuracy)),
            )
    })
    .bind(endpoint)?
    .run()
    .await
}