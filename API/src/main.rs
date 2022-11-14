use actix_web::{App, HttpServer, web};
use actix_web::middleware::Logger;
use env_logger::Env;

mod routes;
mod models;
mod util;

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    let endpoint = format!("0.0.0.0:{}", 8080);
    println!("Running server at {}", endpoint);

    env_logger::init_from_env(Env::default().default_filter_or("info"));

    HttpServer::new(move || {
        App::new()
            .wrap(Logger::default())
            .service(
                web::scope("/sports")
                            .route("/predict", web::get().to(routes::nn::predict))
            )
    })
        .bind(endpoint)?
        .run()
        .await
}

