use std::fs::File;
use std::path::Path;
use std::{env, fs};

use crate::models::api_error::ApiError;
use crate::models::daily_games::Match;
use crate::models::team_stats::TeamStats;
use log::{debug, error};
use redis::{Client, Commands};
use serde::de::DeserializeOwned;
use serde::Serialize;

pub fn write_to_csv(
    matches: &Vec<Match>,
    team_stats: &TeamStats,
    date: &String,
) -> Result<File, ApiError> {
    let data_dir = env::var("DATA_DIR").unwrap();
    let mut csv = String::new();
    for i in 0..2 {
        if i == 1 {
            csv.push(',');
        }
        csv.push_str(team_stats.result_sets[0].headers.join(",").as_str());
    }

    csv.push('\n');

    for mat in matches {
        let teams = vec![mat.home_team_id, mat.away_team_id];
        for team in teams {
            let csv_data: String = team_stats.result_sets[0]
                .get_team_stats(team)
                .iter()
                .map(|val| {
                    val.iter()
                        .map(|val| val.to_string())
                        .collect::<Vec<String>>()
                        .join(",")
                })
                .collect();

            if csv_data.is_empty() {
                error!("Unable to find team stats for team: {team}");
                return Err(ApiError::DependencyError);
            }

            csv.push_str(csv_data.as_str());
            if team == mat.home_team_id {
                csv.push(',');
            }
        }
        csv.push('\n');
    }

    let actual_path = data_dir.to_string();

    if !Path::new(&actual_path).exists() {
        fs::create_dir_all(actual_path).map_err(|error| {
            error!("Error creating data directory: {error}");
            ApiError::IOError
        })?;
    }

    if let Err(e) = fs::write(format!("{data_dir}/{date}.csv"), csv) {
        error!("Error writing to csv: {e}");
        Err(ApiError::IOError)
    } else {
        Ok(File::open(format!("{data_dir}/{date}.csv"))
            .expect("File couldnt be opened? Idk how this happened"))
    }
}

pub fn directory_exists(path: &String) -> bool {
    Path::new(path).exists()
}

pub async fn get_t_from_source<T: DeserializeOwned>(source: &str) -> Result<T, ApiError> {
    let request_start = std::time::Instant::now();
    debug!("Getting data from: {}", source);

    let response = reqwest::get(source).await.map_err(|error| {
        debug!(
            "Request to {} took: {:?}, but failed.",
            source,
            request_start.elapsed()
        );
        error!(
            "Error has occurred while making the request | {}",
            error.to_string()
        );
        ApiError::DependencyError
    })?;
    debug!("Request took: {:?}", request_start.elapsed());

    let response_body = response.text().await.map_err(|error| {
        error!("Error has occurred while getting body | {error}, Came from {source}");
        ApiError::DeserializationError
    })?;

    debug!("Response looks like: {}", response_body);

    let generic = serde_json::from_str::<T>(&response_body).map_err(|error| {
        error!("Error has occurred while deserializing | {error}. Came from {source}");
        ApiError::DeserializationError
    })?;
    Ok(generic)
}

pub fn get_from_cache<T: DeserializeOwned>(
    redis_client_opt: &Option<Client>,
    key: &String,
) -> Option<T> {
    let redis_client = redis_client_opt.as_ref()?;
    let redis_connection_result = redis_client.get_connection();
    let mut redis_connection = redis_connection_result
        .map_err(|err| error!("Error getting Redis connection. Error: {}", err))
        .ok()?;

    let value: String = redis_connection
        .get(key)
        .map_err(|error| {
            error!(
                "Error occurred while trying to get value from KV store. Error: {}",
                error
            )
        })
        .ok()?;

    serde_json::from_str::<T>(&value)
        .map_err(|error| error!("Error occurred during serialization. Error: {}", error))
        .ok()
}

pub fn store_in_cache<T: Serialize>(redis_client_opt: &Option<Client>, key: &String, value: T) {
    let Some(redis_client) = redis_client_opt.as_ref() else {
        debug!("No redis client to cache with");
        return;
    };

    let redis_connection_result = redis_client.get_connection();
    let Ok(mut redis_connection) = redis_connection_result
        .map_err(|error| error!("Error has occurred while trying to get the redis connection. Error: {}", error))
        else { return; };

    let Ok(generic_json) = serde_json::to_string(&value).map_err(|error| {
        error!("Error has occurred while trying to serialize. Error: {}", error);
    }) else { return; };

    redis_connection
        .set(key, generic_json)
        .map_err(|error| {
            error!("Error setting the key. Error: {}", error);
        })
        .unwrap_or(())
}