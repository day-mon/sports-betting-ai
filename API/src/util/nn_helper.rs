use std::env;
use std::fs::File;
use log::{error};
use polars::frame::DataFrame;
use polars::io::SerReader;
use polars::prelude::{CsvReader};
use tensorflow::{Graph, SavedModelBundle, SessionOptions, SessionRunArgs, Tensor};
use crate::models::api_error::ApiError;
use crate::models::daily_games::Match;
use crate::models::prediction::Prediction;
use crate::models::team_stats::TeamStats;
use crate::util::io_helper::write_to_csv;
use crate::util::polars_helper::{convert_rows_to_f64, drop_columns};

const TEAM_DATA_URL: &str = "https://lively-fire-943d.alexanderjoemc.workers.dev/";


pub async fn get_model_data(matches: Option<&Vec<Match>>, date: &String) -> Result<(DataFrame, Option<Vec<Match>>), ApiError> {
    let data_dir = env::var("DATA_DIR").unwrap();

    let file_name = format!("{}/{}.csv", data_dir, date);
    if let Ok(file) = File::open(file_name) {

        let mut df = CsvReader::new(file)
            .has_header(true)
            .low_memory(true)
            .finish()
            .map_err(|error| {
                error!("Error occurred trying to read CSV. Error: {:?}", error);
                ApiError::IOError
            })?;


        if matches.is_none()
        {
            let thing = df.select(["TEAM_ID", "TEAM_NAME", "TEAM_ID_duplicated_0", "TEAM_NAME_duplicated_0"])
                .into_iter().map(|s| Match::from_csv_string(s)).collect::<Vec<Match>>())
            .map_err(|error| {
            error!("Error occurred trying to select columns. Error: {:?}", error);
            ApiError::IOError
        })?;
            println!("{:?}", thing);
            convert_rows_to_f64(&mut df);
            return Ok((drop_columns(df), Some(matches)))
        }

        convert_rows_to_f64(&mut df);

        return Ok((drop_columns(df), None));
    }

    let response =  reqwest::get(TEAM_DATA_URL).await.map_err(|error| {
        error!("Error getting team data: {}", error);
        ApiError::DependencyError
    })?;

    let response_body = response.text().await.map_err(|error| {
        error!("Error getting team data: {}", error);
        ApiError::DependencyError
    })?;

    let daily_stats = serde_json::from_str::<TeamStats>(&response_body).map_err(|error| {
        error!("Error occurred trying to deserialize response body: {}", error);
        ApiError::DeserializationError
    })?;

    let csv_matches = matches.unwrap();
    let written = write_to_csv(csv_matches, &daily_stats, date)?;

    let mut df = drop_columns(CsvReader::new(written)
        .infer_schema(None)
        .has_header(true)
        .low_memory(true)
        .finish()
        .expect("Error happened here"));

    convert_rows_to_f64(&mut df);

    return Ok((drop_columns(df), None));
}


pub fn call_model(df: &DataFrame, matches: &[Match], model_name: &String) -> Result<Vec<Prediction>, ApiError> {
    let model_dir = env::var("MODEL_DIR").unwrap();
    let model_path = format!("{}/{}", model_dir, model_name);
    let sig_in_name = "input_layer_input";
    let sig_out_name = "output_layer";

    let (rows, ..) = df.shape();

    let mut inputs: Vec<Prediction> = Vec::with_capacity(rows);

    for row_index in 0..rows
    {
        let row = df.get_row(row_index);
        let any_val = row.0;
        let conv = any_val.iter().map(|val| val.to_string()).collect::<Vec<String>>();
        let initial_values = conv.iter().map(|val| val.parse::<f32>().unwrap()).collect::<Vec<f32>>();
        let tensor = Tensor::new(&[1, 98]).with_values(&initial_values).map_err(|error| {
            error!("Error occurred trying to create tensor: {}", error);
            ApiError::ModelError
        })?;

        let mut graph = Graph::new();
        let bundle =  SavedModelBundle::load(&SessionOptions::new(), ["serve"], &mut graph, &model_path).map_err(|err| {
            error!("Error occurred trying to load model: {}", err);
            ApiError::ModelError
        })?;

        let session = &bundle.session;
        let signature =  bundle.meta_graph_def().get_signature("serving_default").map_err(|e| {
            error!("Error occurred trying to get signature. {}", e);
            ApiError::ModelError
        })?;

        let input_info = signature.get_input(sig_in_name).map_err(|e| {
            error!("Error occurred trying to get input info. | Error: {}", e);
            ApiError::ModelError
        })?;

        let output_info = signature.get_output(sig_out_name).map_err(|error| {
            error!("Error occurred trying to get output info | Error: {}", error);
            ApiError::ModelError
        })?;

        let input_op = graph.operation_by_name_required(&input_info.name().name).map_err(|error| {
            error!("Error occurred trying to get input op | Error: {}", error);
            ApiError::ModelError
        })?;

        let output_op = graph.operation_by_name_required(&output_info.name().name).map_err(|error| {
            error!("Error occurred trying to get output op | Error: {}", error);
            ApiError::ModelError
        })?;

        let mut args = SessionRunArgs::new();
        args.add_feed(&input_op, 0, &tensor);
        let output_tensor = args.request_fetch(&output_op, 0);

        session.run(&mut args).map_err(|error| {
            error!("Error occurred trying to run session | Error: {}", error);
            ApiError::ModelError
        })?;

        let output = args.fetch::<f32>(output_tensor).map_err(|error| {
            error!("Error occurred trying to fetch output | Error: {}", error);
            ApiError::ModelError
        })?;


        let mut max = 0f32;
        let mut max_index = 0;
        for (i, val) in output.iter().enumerate()
        {
            if *val > max {
                max = *val;
                max_index = i;
            }
        }


        let Some(mat) = matches.get(row_index) else {
            error!("Error occurred trying to get match");
            return Err(ApiError::ModelError)
        };

        let winning = if max_index == 1 {
            Prediction {
                predicted_winner: mat.home_team_name.clone(),
                game_id: mat.game_id.clone(),
            }
        } else {
            Prediction {
                predicted_winner: mat.away_team_name.clone(),
                game_id: mat.game_id.clone(),
            }
        };


        inputs.push(winning);
    }
    Ok(inputs)
}
