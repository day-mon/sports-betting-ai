use std::env;
use std::path::Path;
use actix_cors::Cors;
use actix_web::{App, HttpServer, web};
use actix_web::middleware::Logger;
use diesel::{PgConnection, r2d2};
use diesel::r2d2::ConnectionManager;
use env_logger::Env;
use log::{error, info};
use routes::nn;

mod routes;
mod models;
mod util;
mod services;


#[actix_web::main]
async fn main() -> std::io::Result<()> {
    env_logger::init_from_env(Env::default().default_filter_or("info"));
    let endpoint = format!("0.0.0.0:{}", 8080);

    env::set_var("TF_CPP_MIN_LOG_LEVEL", "2");

    let model_dir = env::var("MODEL_DIR").unwrap_or_else(|_| {
        // exit the process
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


    info!("Running server at {}", endpoint);
    info!("Models directory: {}", std::env::var("MODEL_DIR").unwrap());
    info!("Data directory: {}", std::env::var("DATA_DIR").unwrap());

    let history_pool = pool.clone();
    actix_rt::spawn(async move { services::history_service::run(history_pool).await } );


    HttpServer::new(move || {
        App::new()
            .app_data(web::Data::new(pool.clone()))
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

