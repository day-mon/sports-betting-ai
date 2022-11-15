use std::env;
use std::ops::Not;
use std::path::Path;
use actix_web::{App, HttpServer, web};
use actix_web::middleware::Logger;
use env_logger::Env;
use log::{debug, error, log_enabled, info, Level};

mod routes;
mod models;
mod util;

use structopt::StructOpt;



#[actix_web::main]
async fn main() -> std::io::Result<()> {
    env_logger::init_from_env(Env::default().default_filter_or("info"));
    let endpoint = format!("0.0.0.0:{}", 8080);

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

    info!("Running server at {}", endpoint);
    info!("Model directory: {}", std::env::var("MODEL_DIR").unwrap());
    info!("Data directory: {}", std::env::var("DATA_DIR").unwrap());


    HttpServer::new(move || {
        App::new()
            .wrap(Logger::default())
            .service(
                web::scope("/sports")
                            .route("/predict", web::get().to(routes::nn::predict))
                            .route("/games", web::get().to(routes::nn::games))
            )
    })
        .bind(endpoint)?
        .run()
        .await
}

