use actix_web::{HttpResponse, web};
use crate::models::game::Game;


pub async fn predict(
    model: web::Json<Game>
) -> HttpResponse {
    HttpResponse::Ok().json(model.into_inner())
}