use actix_web::{HttpResponse, error::ResponseError, http::StatusCode};

use serde::{Serialize};
use thiserror::Error;

#[derive(Error, Debug)]
pub enum ApiError {
    #[error("No games found for today")]
    GamesNotFound,
    #[error("Error deserializing response")]
    DeserializationError,
    #[error("Error occurred while calling the model")]
    ModelError,
    #[error("Model not found")]
    ModelNotFound,
    #[error("IO Error has occurred")]
    IOError,
    #[error("A database error has occurred")]
    DatabaseError,
    #[error("A website we rely on returned a invalid response")]
    DependencyError,
    #[error("An Unknown error has occurred")]
    Unknown
}
impl ApiError {
    pub fn name(&self) -> String {
        match self {
            Self::GamesNotFound => "Games not found".to_string(),
            Self::DeserializationError => "Failed to deserialize".to_string(),
            Self::ModelError => "Error occurred while calling the model".to_string(),
            Self::IOError => "An Error occurred during IO".to_string(),
            Self::DependencyError => "A website we rely on returned a invalid response".to_string(),
            Self::DatabaseError => "Error occurred while interfacing with the database".to_string(),
            Self::ModelNotFound => "There is no model with that name".to_string(),
            Self::Unknown => "An unknown error has occurred. This is unusual.".to_string()
        }
    }
}

impl ResponseError for ApiError {
    fn status_code(&self) -> StatusCode {
        match *self {
            Self::GamesNotFound  => StatusCode::NOT_FOUND,
            Self::DeserializationError => StatusCode::INTERNAL_SERVER_ERROR,
            Self::IOError => StatusCode::INTERNAL_SERVER_ERROR,
            Self::ModelNotFound => StatusCode::NOT_FOUND,
            Self::DatabaseError => StatusCode::FAILED_DEPENDENCY,
            Self::ModelError => StatusCode::INTERNAL_SERVER_ERROR,
            Self::DependencyError => StatusCode::FAILED_DEPENDENCY,
            Self::Unknown => StatusCode::INTERNAL_SERVER_ERROR
        }
    }

    fn error_response(&self) -> HttpResponse {
        let status_code = self.status_code();
        let error_response = ErrorResponse {
            code: status_code.as_u16(),
            message: self.to_string(),
            error: self.name(),
        };
        HttpResponse::build(status_code)
            .json(error_response)
    }
}


#[derive(Serialize)]
struct ErrorResponse {
    code: u16,
    error: String,
    message: String,
}