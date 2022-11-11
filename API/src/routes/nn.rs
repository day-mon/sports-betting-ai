use std::fs;
use std::fs::File;
use actix_web::HttpResponse;
use polars::frame::DataFrame;
use polars::io::SerReader;
use polars::prelude::CsvReader;
//use tensorflow::{DataType, Graph, SavedModelBundle, Session, SessionOptions, Tensor};
use crate::models::daily_games::{DailyGames, Match};
use crate::models::team_stats::TeamStats;


const DAILY_GAMES_URL: &str = "https://data.nba.com/data/v2015/json/mobile_teams/nba/2022/scores/00_todays_scores.json";
const TEAM_DATA_URL: &str = "https://lively-fire-943d.alexanderjoemc.workers.dev/";


pub async fn predict(
    // model: web::Json<Game>
) -> HttpResponse {
    let Ok(response) = reqwest::get(DAILY_GAMES_URL).await else {
        return HttpResponse::InternalServerError().json("Booo");
    };

    let Ok(response_body) = response.text().await else {
        return HttpResponse::InternalServerError().json("boo v2");
    };


    let Ok(daily_games) = serde_json::from_str::<DailyGames>(&*response_body) else {
        return HttpResponse::InternalServerError().json("boo v3");
    };


    if daily_games.gs.g.is_empty() {
        return HttpResponse::NotFound().json("There are no games today");
    }
    let date = daily_games.gs.gdte.to_string().replace("\"", "");
    let tids: Vec<Match> = daily_games.gs.g.iter().map(|g| Match { home_team_id: g.h.tid, away_team_id: g.v.tid }).collect();


    let model_data = match get_model_data(&tids, &date).await  {
        Ok(data) => data,
        Err(e) => return HttpResponse::InternalServerError().json(e.to_string())
    };


    HttpResponse::Ok().json("daily_stats")
}


async fn get_model_data(matches: &Vec<Match>, date: &String) -> Result<DataFrame, String> {
    let file_name = format!("./src/data/{}.csv", date);
    // check if file exist if it exist return the string of the file
    if let Ok(file) = File::open(file_name) {
        // convert string to dataframe
         return Ok(CsvReader::new(file)
            .infer_schema(Some(100))
            .has_header(true)
            .finish()
            .expect("Unable to read csv"));
    };


    let Ok(response) = reqwest::get(TEAM_DATA_URL).await else {
        return Err("Error fetching team data".to_owned());
    };

    let Ok(response_body) = response.text().await else {
        return Err("Error getting response body from team data source".to_owned());
    };

    let Ok(daily_stats) = serde_json::from_str::<TeamStats>(&*response_body) else {
        return Err("Error deserializing team data".to_owned());
    };

    let written  = match write_to_csv(matches, &daily_stats, date) {
        Ok(written) => written,
        Err(e) => return Err(e),
    };

   // convert written string to dataframe
    return Ok(CsvReader::new(written)
        .infer_schema(Some(100))
        .has_header(true)
        .finish()
        .expect("Unable to read csv"));
}


// write to a csv and put the two teams that are playing against each other in the same row
// this is so we can use the csv as input to the model
// return a bool if the csv was written successfully
fn write_to_csv(matches: &Vec<Match>, team_stats: &TeamStats, date: &String) -> Result<File, String> {
    let mut csv = String::new();
    for i in 0..2
    {
        if i == 1 { csv.push_str(","); }
        csv.push_str(team_stats.result_sets[0].headers.join(",").as_str());
    }

    csv.push_str("\n");

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
                return Err("Failed to find team stats".to_owned());

            }

            csv.push_str(csv_data.as_str());
            if team == mat.home_team_id { csv.push_str(","); }
        }
        csv.push_str("\n");
    }


    let written = fs::write( format!("./src/data/{}.csv", date), csv);
    if written.is_err() {
        return Err("Failed to write to csv".to_owned());
    } else {
        Ok(File::open(format!("./src/data/{}.csv", date)).unwrap())
    }
}

fn call_model(stats: &TeamStats) {
    // let export_dir = Path::new("./src/model");
    // let options = &SessionOptions::new();
    // let tags = &["serve"];
    // let mut graph = Graph::new();
    //
    // let model = SavedModelBundle::load(options, tags, &mut graph, export_dir).unwrap();
    //
    let file = File::open("data.csv").unwrap_or_else(|_| panic!("Failed to open file"));
    // let fields = csv::Reader::from_reader(file).headers().unwrap().into_iter().collect::<Vec<String>>();
    // let schema : Arc<Schema> = Arc::new (Schema::from(vec![]));
    let df = CsvReader::new(file)
        .infer_schema(Some(100))
        .has_header(true)
        .finish();

    //let tensor = df_to_tensor(df.unwrap());

    println!("{:?}", df.is_ok());
}

