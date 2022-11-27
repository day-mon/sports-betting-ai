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


pub async fn get_model_data(matches: &Vec<Match>, date: &String) -> Result<DataFrame, ApiError> {
    let data_dir = env::var("DATA_DIR").unwrap();

    let file_name = format!("{}/{}.csv", data_dir, date);
    if let Ok(file) = File::open(file_name) {

        let mut df = CsvReader::new(file)
            .has_header(true)
            .low_memory(true)
            .finish()
            .expect("Unable to read csv");


        convert_rows_to_f64(&mut df);

        return Ok(drop_columns(df));
    }

    let response = match reqwest::get(TEAM_DATA_URL).await {
        Ok(res) => res,
        Err(err) => {
            error!("Error getting team data: {}", err);
            return Err(ApiError::DependencyError)
        }
    };

    let response_body = match response.text().await  {
        Ok(res) => res,
        Err(err) => {
            error!("Error getting team data: {}", err);
            return Err(ApiError::DependencyError)
        }
    };

    let daily_stats  = match serde_json::from_str::<TeamStats>(&response_body) {
        Ok(stats) => stats,
        Err(err) => {
            error!("Error occurred trying to deserialize response body: {}", err);
            return Err(ApiError::DeserializationError)
        }
    };

    let written = write_to_csv(matches, &daily_stats, date)?;

    let mut df = drop_columns(CsvReader::new(written)
        .infer_schema(None)
        .has_header(true)
        .low_memory(true)
        .finish()
        .expect("Error happened here"));

    convert_rows_to_f64(&mut df);

    Ok(df)
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
        let tensor = match Tensor::new(&[1, 98])
            .with_values(&initial_values) {
            Ok(tensor) => tensor,
            Err(err) => {
                error!("Error occurred trying to create tensor: {}", err);
                return Err(ApiError::ModelError)
            }
        };

        let mut graph = Graph::new();
        let bundle = match SavedModelBundle::load(&SessionOptions::new(), ["serve"], &mut graph,  &model_path) {
            Ok(bundle) => bundle,
            Err(err) => {
                error!("Error occurred trying to load model: {}", err);
                return Err(ApiError::ModelError)
            }
        };


        let session = &bundle.session;
        let signature = match bundle
            .meta_graph_def()
            .get_signature("serving_default") {
            Ok(sig) => sig,
            Err(e) => {
                error!("Error occurred trying to get signature. {}", e);
                return Err(ApiError::ModelError)
            }
        };

        let input_info = match signature.get_input(sig_in_name) {
            Ok(info) => info,
            Err(e) => {
                error!("Error occurred trying to get input info. | Error: {}", e);
                return Err(ApiError::ModelError)
            }
        };
        let output_info = match signature.get_output(sig_out_name) {
            Ok(info) => info,
            Err(e) => {
                error!("Error occurred trying to get output info | Error: {}", e);
                return Err(ApiError::ModelError)
            }
        };

        let input_op = match graph.operation_by_name_required(&input_info.name().name) {
            Ok(op) => op,
            Err(e) => {
                error!("Error occurred trying to get input op | Error: {}", e);
                return Err(ApiError::ModelError)
            }
        };
        let output_op = match graph.operation_by_name_required(&output_info.name().name) {
            Ok(op) => op,
            Err(e) => {
                error!("Error occurred trying to get output op | Error: {}", e);
                return Err(ApiError::ModelError)
            }
        };

        let mut args = SessionRunArgs::new();
        args.add_feed(&input_op, 0, &tensor);
        let output_tensor = args.request_fetch(&output_op, 0);

        match session.run(&mut args) {
            Ok(_) => {},
            Err(e) => {
                error!("Error occurred trying to run session | Error: {}", e);
                return Err(ApiError::ModelError)
            }
        };

        let output = match args.fetch::<f32>(output_tensor) {
            Ok(output) => output,
            Err(e) => {
                error!("Error occurred trying to fetch output | Error: {}", e);
                return Err(ApiError::ModelError)
            }
        };

        let mut max = 0f32;
        let mut max_index = 0;
        for (i, val) in output.iter().enumerate()
        {
            if *val > max {
                max = *val;
                max_index = i;
            }
        }

        let mat = match matches.get(row_index) {
            Some(mat) => mat,
            None => {
                error!("Error occurred trying to get match");
                return Err(ApiError::ModelError)
            }
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
