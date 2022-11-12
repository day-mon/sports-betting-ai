use std::fs;
use std::fs::File;
use crate::models::daily_games::Match;
use crate::models::team_stats::TeamStats;

pub fn write_to_csv(matches: &Vec<Match>, team_stats: &TeamStats, date: &String) -> Result<File, String> {
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

            if csv_data.is_empty() { return Err("Failed to find team stats".to_owned()); }

            csv.push_str(csv_data.as_str());
            if team == mat.home_team_id { csv.push_str(","); }
        }
        csv.push_str("\n");
    }


    let written = fs::write( format!("./src/data/{}.csv", date), csv);
    if written.is_err() {
        return Err("Failed to write to csv".to_owned());
    } else {
        Ok(File::open(format!("./src/data/{}.csv", date)).expect("File couldnt be opened? Idk how this happened"))
    }
}
