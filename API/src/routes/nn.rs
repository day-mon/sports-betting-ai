use actix_web::{HttpResponse, web};
use crate::routes::game::Game;


pub async fn predict(
    model: web::Json<Game>
) -> HttpResponse {
    HttpResponse::Ok().json(model.into_inner())
}