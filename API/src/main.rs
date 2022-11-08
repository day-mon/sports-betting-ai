use actix_web::{middleware, post, web, App, Error, HttpResponse, HttpServer};

#[actix_web::main]
async fn main() -> std::io::Result<()> {

    let endpoint = format!("0.0.0.0:{}", 8080);
    println!("Running server at {}", endpoint);

    HttpServer::new(move || {
        App::new()
            .wrap(middleware::Logger::default())
    })
        .bind(endpoint)?
        .run()
        .await



}
