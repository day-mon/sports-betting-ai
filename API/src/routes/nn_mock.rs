use actix_web::{HttpResponse, web};
use actix_web::http::StatusCode;
use serde::{Deserialize, Serialize};
use crate::routes::nn::PredictModel;


pub async fn predict(
    model: web::Json<PredictModel>
) -> HttpResponse {
    HttpResponse::new(StatusCode::OK)
}