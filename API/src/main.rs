use std::env;
use std::path::Path;
use actix_cors::Cors;
use actix_web::{App, HttpServer, web};
use actix_web::middleware::Logger;
use diesel::{PgConnection, r2d2};
use diesel::r2d2::ConnectionManager;
use routes::nn;

mod routes;
mod models;
mod util;
mod services;

extern crate emoji_logger;
#[macro_use] extern crate log;


const TENSOR_FLOW_LOGGING_FLAG: &str = "TF_CPP_MIN_LOG_LEVEL";

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    emoji_logger::init_custom_env("LOG_LEVEL");
    let endpoint = format!("0.0.0.0:{}", 8080);


    env::set_var(TENSOR_FLOW_LOGGING_FLAG, "2");

    let model_dir = env::var("MODEL_DIR").unwrap_or_else(|_| {
        error!("MODEL_DIR environment variable not set");
        std::process::exit(1);
    });

    if !Path::new(&model_dir).exists() {
        error!("MODEL_DIR set but {} doesnt exist", &model_dir);
        std::process::exit(1);
    }

    env::var("DATA_DIR").unwrap_or_else(|_| {
        // exit the process
        error!("DATA_DIR environment variable not set");
        std::process::exit(1);
    });

    let database_url = env::var("DATABASE_URL").unwrap_or_else(|_| {
        // exit the process
        error!("DATABASE_URL environment variable not set");
        std::process::exit(1);
    });


    let manager = ConnectionManager::<PgConnection>::new(&database_url);

    let pool = r2d2::Pool::builder()
        .max_size(5)
        .build(manager)
        .expect("Could not connect to database!");

    let redis_url = env::var("REDIS_URL").unwrap_or_default();

    if redis_url.is_empty() {
        warn!("REDIS_URL environment variable not set, we will not cache tensorflow model responses.");
    }

    let redis_client = redis::Client::open(redis_url.clone()).ok();

    if redis_client.is_none() && !redis_url.is_empty() {
        warn!("Could not connect to redis, we will not cache tensorflow model responses.");
    }


    info!("Running server at {}", endpoint);
    info!("Models directory: {}", std::env::var("MODEL_DIR").unwrap());
    info!("Data directory: {}", std::env::var("DATA_DIR").unwrap());
    if redis_client.is_some() {
        info!("Redis client running at: {}", redis_url)
    }

    let history_pool = pool.clone();
    actix_rt::spawn(async move { services::history_service::run(history_pool).await } );


    HttpServer::new(move || {
        App::new()
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
            )
    })
        .bind(endpoint)?
        .run()
        .await

}
