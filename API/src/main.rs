use actix_cors::Cors;
use actix_web::middleware::Logger;
use actix_web::{web, App, HttpServer};
use diesel::r2d2::ConnectionManager;
use diesel::{r2d2, PgConnection};
use routes::nn;
use std::path::Path;
use std::{env, thread};

pub struct ModelDir(pub String);
pub struct WorkerUrl(pub String);
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
    let port = env::var("PORT").unwrap_or_else(|_| "8080".to_string());
    let endpoint = format!("0.0.0.0:{port}");

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

    let Ok(worker_url) = env::var("WORKER_URL") else {
        error!("WORKER_URL environment variable not set");
        std::process::exit(1);
    };

    let Ok(database_url) = env::var("DATABASE_URL") else {
        error!("DATABASE_URL environment variable not set");
        std::process::exit(1);
    };

    let missed_games_service =
        env::var("MISSED_GAMES_SERVICE").unwrap_or_else(|_| "TRUE".to_string());
    if missed_games_service.to_uppercase() != "TRUE"
        && missed_games_service.to_uppercase() != "FALSE"
    {
        info!("{missed_games_service} is not a valid value for MISSED_GAMES_SERVICE, defaulting to TRUE");
    }

    let manager = ConnectionManager::<PgConnection>::new(&database_url);

    let pool = r2d2::Pool::builder()
        .max_size(5)
        .build(manager)
        .expect("Could not connect to database!");

    let redis_client = match env::var("REDIS_URL") {
        Ok(url) => {
            let client = redis::Client::open(url)
                .map_err(|error| warn!("REDIS_URL environment variable not set, we will not cache tensorflow model responses. Error {error}"))
                .ok();

            let connection = client.as_ref().map(|client| {
                client
                    .get_connection()
                    .map_err(|error| warn!("Could not connect to redis. Error: {error}"))
                    .ok()
            });

            if connection.is_some() && connection.as_ref().unwrap().is_none() {
                None
            } else {
                client
            }
        }
        Err(error) => {
            warn!("REDIS_URL environment variable not set, we will not cache tensorflow model responses. Error: {error}");
            None
        }
    };

    info!("Running server at {endpoint}");
    info!("Models directory: {model_dir}");
    info!("Data directory: {data_dir}");
    info!("CF Worker: {worker_url}");
    if redis_client.is_some() {
        let redis_url = env::var("REDIS_URL").unwrap();
        info!("Redis is up and accepting connections at {redis_url}");
    }

    let history_pool = pool.clone();
    let history_model_dir = model_dir.clone();

    thread::spawn(move || {
        actix_rt::System::new().block_on(async move {
            services::history_service::run(history_pool, history_model_dir).await
        })
    });

    if missed_games_service == "TRUE" {
        let missed_games_pool = pool.clone();
        let missed_games_model_dir = model_dir.clone();
        let missed_games_data_dir = data_dir.clone();
        let missed_games_worker_url = worker_url.clone();
        thread::spawn(move || {
            actix_rt::System::new().block_on(async move {
                services::missed_games_service::run(
                    missed_games_pool,
                    missed_games_model_dir,
                    missed_games_data_dir,
                    missed_games_worker_url,
                )
                .await
            })
        });
    }

    HttpServer::new(move || {
        App::new()
            .app_data(web::Data::new(ModelDir(model_dir.clone())))
            .app_data(web::Data::new(DataDir(data_dir.clone())))
            .app_data(web::Data::new(pool.clone()))
            .app_data(web::Data::new(WorkerUrl(worker_url.clone())))
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