use crate::models::api_error::ApiError;
use crate::models::daily_games::Match;
use crate::models::prediction::Prediction;
use crate::models::team_stats::TeamStats;
use crate::util::io_helper::{get_t_from_source, write_to_csv};
use crate::util::polars_helper::{convert_rows_to_f64, drop_columns};
use log::error;
use polars::io::SerReader;
use polars::prelude::{CsvReader, DataFrame};
use std::fs::File;
use tensorflow::{Graph, SavedModelBundle, SessionOptions, SessionRunArgs, Tensor};

pub async fn get_model_data(
    matches: Option<&Vec<Match>>,
    date: &String,
    model_name: &str,
    data_dir: &String,
    worker_url: &str,
) -> Result<DataFrame, ApiError> {
    let file_name = format!("{data_dir}/{date}.csv");
    if let Ok(file) = File::open(&file_name) {
        let mut df = CsvReader::new(file)
            .has_header(true)
            .finish()
            .map_err(|error| {
                error!("Error occurred trying to read CSV. Error: {error}");
                ApiError::IOError
            })?;

        convert_rows_to_f64(&mut df);
        drop_columns(&mut df, model_name);

        return Ok(df);
    }

    let Some(matches) = matches else {
        error!("Matches were passed in as a none. Only pass in None if you know for certain that the file exist!. File name {file_name}");
        return Err(ApiError::Unknown);
    };

    let daily_stats = get_t_from_source::<TeamStats>(worker_url).await?;

    let written = write_to_csv(matches, &daily_stats, date, data_dir)?;

    let mut df = CsvReader::new(written)
        .infer_schema(None)
        .has_header(true)
        .finish()
        .map_err(|error| {
            error!("Error occurred trying to read CSV. Error: {:?}", error);
            ApiError::IOError
        })?;

    convert_rows_to_f64(&mut df);
    drop_columns(&mut df, model_name);

    Ok(df)
}

pub fn call_model(
    df: &DataFrame,
    matches: &[Match],
    model_name: &String,
    model_dir: &String,
) -> Result<Vec<Prediction>, ApiError> {
    let model_path = format!("{model_dir}/{model_name}");
    let sig_in_name = if model_name != "v2" {
        "input_layer_input"
    } else {
        "flatten_4_input"
    };
    let sig_out_name = "output_layer";

    let (rows, columns) = df.shape();

    let mut inputs: Vec<Prediction> = Vec::with_capacity(rows);

    for row_index in 0..rows {
        let row = df.get_row(row_index);
        let any_val = row.0;
        let conv = any_val
            .iter()
            .map(|val| val.to_string())
            .collect::<Vec<String>>();
        let initial_values = conv
            .iter()
            .map(|val| {
                println!("Val: {val}");
                val.parse::<f32>().unwrap_or(0f32)
            })
            .collect::<Vec<f32>>();
        let tensor = Tensor::new(&[1, columns as u64])
            .with_values(&initial_values)
            .map_err(|error| {
                error!("Error occurred trying to create tensor: {error}");
                ApiError::ModelError
            })?;

        let mut graph = Graph::new();
        let bundle =
            SavedModelBundle::load(&SessionOptions::new(), ["serve"], &mut graph, &model_path)
                .map_err(|err| {
                    error!("Error occurred trying to load model: {err}");
                    ApiError::ModelError
                })?;

        let session = &bundle.session;
        let signature = bundle
            .meta_graph_def()
            .get_signature("serving_default")
            .map_err(|e| {
                error!("Error occurred trying to get signature. {e}");
                ApiError::ModelError
            })?;

        let input_info = signature.get_input(sig_in_name).map_err(|e| {
            error!("Error occurred trying to get input info. | Error: {e}");
            ApiError::ModelError
        })?;

        let output_info = signature.get_output(sig_out_name).map_err(|error| {
            error!("Error occurred trying to get output info | Error: {error}");
            ApiError::ModelError
        })?;

        let input_op = graph
            .operation_by_name_required(&input_info.name().name)
            .map_err(|error| {
                error!("Error occurred trying to get input op | Error: {error}");
                ApiError::ModelError
            })?;

        let output_op = graph
            .operation_by_name_required(&output_info.name().name)
            .map_err(|error| {
                error!("Error occurred trying to get output op | Error: {error}");
                ApiError::ModelError
            })?;

        let mut args = SessionRunArgs::new();
        args.add_feed(&input_op, 0, &tensor);
        let output_tensor = args.request_fetch(&output_op, 0);

        session.run(&mut args).map_err(|error| {
            error!("Error occurred trying to run session | Error: {error}");
            ApiError::ModelError
        })?;

        let output = args.fetch::<f32>(output_tensor).map_err(|error| {
            error!("Error occurred trying to fetch output | Error: {error}");
            ApiError::ModelError
        })?;

        let result = if model_name == "ou" {
            retrieve_game_score(&output, matches, row_index)?
        } else {
            retrieve_match_winner(&output, matches, row_index)?
        };

        inputs.push(result);
    }
    Ok(inputs)
}

fn retrieve_game_score(
    output: &Tensor<f32>,
    matches: &[Match],
    row_index: usize,
) -> Result<Prediction, ApiError> {
    if output.len() == 0 {
        error!("Some how the tensor did no produce a response");
        return Err(ApiError::ModelError);
    }

    Ok(Prediction {
        game_id: matches[row_index].game_id.clone(),
        prediction: (output[0] as u16).to_string(),
        confidence: None,
        prediction_type: "score".to_string(),
    })
}

fn retrieve_match_winner(
    output: &Tensor<f32>,
    matches: &[Match],
    row_index: usize,
) -> Result<Prediction, ApiError> {
    let mut max = 0f32;
    let mut max_index = 0;
    for (i, val) in output.iter().enumerate() {
        if *val > max {
            max = *val;
            max_index = i;
        }
    }

    let Some(mat) = matches.get(row_index) else {
        error!("Error occurred trying to get match");
        return Err(ApiError::ModelError)
    };

    if max_index == 1 {
        Ok(Prediction {
            prediction_type: "win-loss".to_string(),
            prediction: mat.home_team_name.clone(),
            game_id: mat.game_id.clone(),
            confidence: Some(max),
        })
    } else {
        Ok(Prediction {
            prediction_type: "win-loss".to_owned(),
            prediction: mat.away_team_name.clone(),
            game_id: mat.game_id.clone(),
            confidence: Some(max),
        })
    }
}