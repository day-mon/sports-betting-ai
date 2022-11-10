use actix_web::HttpResponse;
use tensorflow::{DEFAULT_SERVING_SIGNATURE_DEF_KEY, Graph, PREDICT_INPUTS, PREDICT_OUTPUTS, SavedModelBundle, SessionOptions, Tensor};
use crate::models::daily_games::{DailyGames, Match};
use crate::models::team_stats::TeamStats;

const DAILY_GAMES_URL: &str = "https://data.nba.com/data/v2015/json/mobile_teams/nba/2022/scores/00_todays_scores.json";
const TEAM_DATA_URL: &str = "https://jsonget.alexanderjoemc.workers.dev/";


pub async fn predict(
    // model: web::Json<Game>
) -> HttpResponse {
    let Ok(response) =  reqwest::get(DAILY_GAMES_URL).await else {
        return HttpResponse::InternalServerError().json("Booo")
    };

    let Ok(response_body) = response.text().await else {
      return HttpResponse::InternalServerError().json("boo v2");
    };

    let daily_games: DailyGames = serde_json::from_str(&*response_body).unwrap();
    if daily_games.gs.g.is_empty() {
        return HttpResponse::NotFound().json("There are no games today");
    }

    let tids: Vec<Match> = daily_games.gs.g.iter().map(|g| Match { home_team_id: g.h.tid, away_team_id: g.v.tid }).collect();

    let Ok(response) = reqwest::get(TEAM_DATA_URL).await else {
       return HttpResponse::InternalServerError().json("Booo");
    };


    let Ok(response_body) = response.text().await else {
         return HttpResponse::InternalServerError().json("boo v2");
    };

    let mut team_stats: TeamStats = serde_json::from_str(&*response_body).unwrap();

    // figure out a way not to always write to csv. We only need to write to a csv everyday
    let written = write_to_csv(&tids, &mut team_stats);

    if !written {
        return HttpResponse::InternalServerError().json("Failed parse data to use for model");
    }



    HttpResponse::Ok().json("stats")
}

// write to a csv and put the two teams that are playing against each other in the same row
// this is so we can use the csv as input to the model
// return a bool if the csv was written successfully
fn write_to_csv(matches: &Vec<Match>, team_stats: &mut TeamStats) -> bool {
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

            if csv_data.is_empty() { return false; }

            csv.push_str(csv_data.as_str());
            if team == mat.home_team_id { csv.push_str(","); }
        }
        csv.push_str("\n");
    }

    let written= std::fs::write("data.csv", csv);
    written.is_ok()
}

