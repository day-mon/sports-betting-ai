use actix_web::{HttpResponse};
use serde::Serialize;

pub enum ResponseType<T>{
    Ok(T),
    NotFound(T),
}

impl < T: Serialize > ResponseType<T> {
    pub(crate) fn get_response(&self) -> HttpResponse {
        match self {
            ResponseType::Ok(data) => HttpResponse::Ok().json(data),
            ResponseType::NotFound(data) => HttpResponse::NotFound().json("Not found"),
        }
    }
}