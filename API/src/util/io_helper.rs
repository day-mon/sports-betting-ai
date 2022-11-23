use std::{env, fs};
use std::fs::File;
use std::path::Path;
use log::{error, info};
use serde::de::DeserializeOwned;
use crate::models::api_error::ApiError;
use crate::models::daily_games::Match;
use crate::models::team_stats::TeamStats;

pub fn write_to_csv(matches: &Vec<Match>, team_stats: &TeamStats, date: &String) -> Result<File, ApiError> {
    let data_dir = env::var("DATA_DIR").unwrap();
    let mut csv = String::new();
    for i in 0..2
    {
        if i == 1 { csv.push(','); }
        csv.push_str(team_stats.result_sets[0].headers.join(",").as_str());
    }

    csv.push('\n');

    for mat in matches
    {

        let teams = vec![mat.home_team_id, mat.away_team_id];
        for team in teams
        {
            let csv_data: String = team_stats.result_sets[0].get_team_stats(team)
                .iter()
                .map(|val| val.iter().map(|val| val.to_string()).collect::<Vec<String>>().join(","))
                .collect();

            if csv_data.is_empty() {
                error!("Unable to find team stats for team: {}", team);
                return Err(ApiError::DependencyError)
            }

            csv.push_str(csv_data.as_str());
            if team == mat.home_team_id { csv.push(','); }
        }
        csv.push('\n');
    }

    let actual_path = data_dir.to_string();

    if !Path::new(&actual_path).exists() {
         match fs::create_dir_all(actual_path) {
             Ok(ret) => ret,
             Err(err) => {
                 error!("Error creating data directory: {}", err);
                 return Err(ApiError::IOError)
             }
        };
    }



    let written = fs::write( format!("{}/{}.csv", data_dir, date), csv);
    if written.is_err() {
        error!("Error writing to csv: {}", written.err().unwrap());
        Err(ApiError::IOError)
    } else {
        Ok(File::open(format!("{}/{}.csv", data_dir, date)).expect("File couldnt be opened? Idk how this happened"))
    }
}


pub async fn get_t_from_source<T: DeserializeOwned>(source: &str) -> Result<T, ApiError> {
    let response = match reqwest::get(source).await {
        Ok(res) => res,
        Err(err) => return {
            error!("Error has occurred while making the request | {}", err.to_string());
            Err(ApiError::DependencyError)
        }
    };

    let response_body = match response.text().await {
        Ok(res) => res,
        Err(err) => return {
            error!("Error has occurred while getting body | {}", err.to_string());
            Err(ApiError::DeserializationError)
        }
    };

    let generic = match serde_json::from_str::<T>(&response_body) {
        Ok(t) => t,
        Err(err) => return {
            error!("Error has occurred while deserializing | {}", err.to_string());
            Err(ApiError::DeserializationError)
        }
    };
    Ok(generic)
}

