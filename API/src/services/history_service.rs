use std::collections::HashMap;
use std::ops::{DerefMut};
use std::path::Path;
use diesel::{PgConnection, r2d2};
use diesel::r2d2::{ConnectionManager};
use log::{error, info, warn};
use crate::models::game_with_odds::{GameWithOdds, InjuryStore, SavedGame};
use crate::models::prediction::Prediction;
use crate::util::io_helper::{directory_exists, get_t_from_source};

pub async fn run(pool: r2d2::Pool<ConnectionManager<PgConnection>>)
{
    loop
    {
        info!("Attempting to grab game for history");
        // let Ok(games) = get_t_from_source::<Vec<GameWithOdds>>("http://127.0.0.1:8080/sports/games").await else {
        //     error!("Error occurred while trying to get games");
        //     actix_rt::time::sleep(std::time::Duration::from_secs(20)).await;
        //     continue;
        // };

        let str = r#"[
   {
      "game_id":"0022200395",
      "date":"2022-12-11",
      "venue":"Smoothie King Center",
      "start_time":"Final",
      "home_team_name":"New Orleans Pelicans",
      "home_team_score":"98",
      "away_team_name":"Phoenix Suns",
      "away_team_score":"90",
      "time_left":"",
      "home_team_id":1610612740,
      "away_team_id":1610612756,
      "odds":[
         {
            "book_name":"betmgm",
            "home_team_odds":-160,
            "away_team_odds":135,
            "home_team_opening_odds":-140,
            "away_team_opening_odds":115
         },
         {
            "book_name":"draftkings",
            "home_team_odds":-165,
            "away_team_odds":140,
            "home_team_opening_odds":-110,
            "away_team_opening_odds":-110
         },
         {
            "book_name":"fanduel",
            "home_team_odds":-166,
            "away_team_odds":140,
            "home_team_opening_odds":-130,
            "away_team_opening_odds":110
         },
         {
            "book_name":"caesars",
            "home_team_odds":-164,
            "away_team_odds":140,
            "home_team_opening_odds":-145,
            "away_team_opening_odds":122
         },
         {
            "book_name":"pointsbet",
            "home_team_odds":-165,
            "away_team_odds":130,
            "home_team_opening_odds":-140,
            "away_team_opening_odds":110
         },
         {
            "book_name":"wynn",
            "home_team_odds":-169,
            "away_team_odds":143,
            "home_team_opening_odds":-120,
            "away_team_opening_odds":100
         },
         {
            "book_name":"bet_rivers_ny",
            "home_team_odds":-177,
            "away_team_odds":143,
            "home_team_opening_odds":-134,
            "away_team_opening_odds":107
         }
      ],
      "home_team_injuries":[
         {
            "player":"Brandon Ingram",
            "team":"NOP",
            "position":"F",
            "game_id":"0022200395",
            "injury":"Toe",
            "status":"Out"
         },
         {
            "player":"Herbert Jones",
            "team":"NOP",
            "position":"F",
            "game_id":"0022200395",
            "injury":"Ankle",
            "status":"Out"
         },
         {
            "player":"E.J. Liddell",
            "team":"NOP",
            "position":"F",
            "game_id":"0022200395",
            "injury":"Knee",
            "status":"Out"
         }
      ],
      "away_team_injuries":[
         {
            "player":"Devin Booker",
            "team":"PHX",
            "position":"G",
            "game_id":"0022200395",
            "injury":"Hamstring",
            "status":"Out"
         },
         {
            "player":"Jae Crowder",
            "team":"PHX",
            "position":"F",
            "game_id":"0022200395",
            "injury":"Not Injury Related",
            "status":"Out"
         },
         {
            "player":"Cameron Johnson",
            "team":"PHX",
            "position":"F",
            "game_id":"0022200395",
            "injury":"Knee",
            "status":"Out"
         },
         {
            "player":"Duane Washington",
            "team":"PHX",
            "position":"G",
            "game_id":"0022200395",
            "injury":"Hip",
            "status":"Out"
         }
      ]
   },
   {
      "game_id":"0022200396",
      "date":"2022-12-11",
      "venue":"Little Caesars Arena",
      "start_time":"Final",
      "home_team_name":"Detroit Pistons",
      "home_team_score":"120",
      "away_team_name":"Los Angeles Lakers",
      "away_team_score":"340",
      "time_left":"00:00.0",
      "home_team_id":1610612765,
      "away_team_id":1610612747,
      "odds":[
         {
            "book_name":"betmgm",
            "home_team_odds":165,
            "away_team_odds":-200,
            "home_team_opening_odds":155,
            "away_team_opening_odds":-190
         },
         {
            "book_name":"draftkings",
            "home_team_odds":175,
            "away_team_odds":-205,
            "home_team_opening_odds":210,
            "away_team_opening_odds":-250
         },
         {
            "book_name":"fanduel",
            "home_team_odds":176,
            "away_team_odds":-210,
            "home_team_opening_odds":184,
            "away_team_opening_odds":-220
         },
         {
            "book_name":"caesars",
            "home_team_odds":152,
            "away_team_odds":-179,
            "home_team_opening_odds":210,
            "away_team_opening_odds":-263
         },
         {
            "book_name":"pointsbet",
            "home_team_odds":175,
            "away_team_odds":-210,
            "home_team_opening_odds":180,
            "away_team_opening_odds":-220
         },
         {
            "book_name":"wynn",
            "home_team_odds":170,
            "away_team_odds":-204,
            "home_team_opening_odds":175,
            "away_team_opening_odds":-208
         },
         {
            "book_name":"bet_rivers_ny",
            "home_team_odds":175,
            "away_team_odds":-225,
            "home_team_opening_odds":175,
            "away_team_opening_odds":-225
         }
      ],
      "home_team_injuries":[
         {
            "player":"Cade Cunningham",
            "team":"DET",
            "position":"G",
            "game_id":"0022200396",
            "injury":"Lower Leg",
            "status":"Out"
         },
         {
            "player":"Isaiah Livers",
            "team":"DET",
            "position":"F",
            "game_id":"0022200396",
            "injury":"Shoulder",
            "status":"Out"
         }
      ],
      "away_team_injuries":[
         {
            "player":"Anthony Davis",
            "team":"LAL",
            "position":"C",
            "game_id":"0022200396",
            "injury":"Back",
            "status":"Game Time Decision"
         },
         {
            "player":"Wenyen Gabriel",
            "team":"LAL",
            "position":"F",
            "game_id":"0022200396",
            "injury":"Shoulder",
            "status":"Out"
         },
         {
            "player":"LeBron James",
            "team":"LAL",
            "position":"F",
            "game_id":"0022200396",
            "injury":"Ankle",
            "status":"Game Time Decision"
         },
         {
            "player":"Cole Swider",
            "team":"LAL",
            "position":"F",
            "game_id":"0022200396",
            "injury":"Foot",
            "status":"Game Time Decision"
         },
         {
            "player":"Juan Toscano-Anderson",
            "team":"LAL",
            "position":"F",
            "game_id":"0022200396",
            "injury":"Ankle",
            "status":"Out"
         }
      ]
   },
   {
      "game_id":"0022200397",
      "date":"2022-12-11",
      "venue":"Madison Square Garden",
      "start_time":"Final",
      "home_team_name":"New York Knicks",
      "home_team_score":"43",
      "away_team_name":"Sacramento Kings",
      "away_team_score":"0",
      "time_left":"00:00.0",
      "home_team_id":1610612752,
      "away_team_id":1610612758,
      "odds":[
         {
            "book_name":"betmgm",
            "home_team_odds":-150,
            "away_team_odds":125,
            "home_team_opening_odds":-140,
            "away_team_opening_odds":115
         },
         {
            "book_name":"draftkings",
            "home_team_odds":-150,
            "away_team_odds":130,
            "home_team_opening_odds":-140,
            "away_team_opening_odds":120
         },
         {
            "book_name":"fanduel",
            "home_team_odds":-154,
            "away_team_odds":130,
            "home_team_opening_odds":-130,
            "away_team_opening_odds":110
         },
         {
            "book_name":"caesars",
            "home_team_odds":-154,
            "away_team_odds":130,
            "home_team_opening_odds":-141,
            "away_team_opening_odds":118
         },
         {
            "book_name":"pointsbet",
            "home_team_odds":-150,
            "away_team_odds":120,
            "home_team_opening_odds":-140,
            "away_team_opening_odds":110
         },
         {
            "book_name":"wynn",
            "home_team_odds":-159,
            "away_team_odds":130,
            "home_team_opening_odds":-145,
            "away_team_opening_odds":123
         },
         {
            "book_name":"bet_rivers_ny",
            "home_team_odds":-150,
            "away_team_odds":123,
            "home_team_opening_odds":-134,
            "away_team_opening_odds":107
         }
      ],
      "home_team_injuries":[
         {
            "player":"Ryan Arcidiacono",
            "team":"NYK",
            "position":"G",
            "game_id":"0022200397",
            "injury":"Ankle",
            "status":"Out"
         },
         {
            "player":"Trevor Keels",
            "team":"NYK",
            "position":"G",
            "game_id":"0022200397",
            "injury":"Groin",
            "status":"Out"
         },
         {
            "player":"Obi Toppin",
            "team":"NYK",
            "position":"F",
            "game_id":"0022200397",
            "injury":"Lower Leg",
            "status":"Out"
         }
      ],
      "away_team_injuries":[
         {
            "player":"De'Aaron Fox",
            "team":"SAC",
            "position":"G",
            "game_id":"0022200397",
            "injury":"Foot",
            "status":"Out"
         },
         {
            "player":"Alex Len",
            "team":"SAC",
            "position":"C",
            "game_id":"0022200397",
            "injury":"Illness",
            "status":"Out"
         }
      ]
   },
   {
      "game_id":"0022200398",
      "date":"2022-12-11",
      "venue":"Amway Center",
      "start_time":"Final",
      "home_team_name":"Orlando Magic",
      "home_team_score":"12",
      "away_team_name":"Toronto Raptors",
      "away_team_score":"0",
      "time_left":"00:00.0",
      "home_team_id":1610612753,
      "away_team_id":1610612761,
      "odds":[
         {
            "book_name":"betmgm",
            "home_team_odds":190,
            "away_team_odds":-250,
            "home_team_opening_odds":220,
            "away_team_opening_odds":-275
         },
         {
            "book_name":"draftkings",
            "home_team_odds":215,
            "away_team_odds":-255,
            "home_team_opening_odds":210,
            "away_team_opening_odds":-250
         },
         {
            "book_name":"fanduel",
            "home_team_odds":215,
            "away_team_odds":-260,
            "home_team_opening_odds":225,
            "away_team_opening_odds":-275
         },
         {
            "book_name":"caesars",
            "home_team_odds":205,
            "away_team_odds":-250,
            "home_team_opening_odds":210,
            "away_team_opening_odds":-263
         },
         {
            "book_name":"pointsbet",
            "home_team_odds":200,
            "away_team_odds":-245,
            "home_team_opening_odds":210,
            "away_team_opening_odds":-245
         },
         {
            "book_name":"wynn",
            "home_team_odds":215,
            "away_team_odds":-263,
            "home_team_opening_odds":205,
            "away_team_opening_odds":-250
         },
         {
            "book_name":"bet_rivers_ny",
            "home_team_odds":205,
            "away_team_odds":-265,
            "home_team_opening_odds":215,
            "away_team_opening_odds":-278
         }
      ],
      "home_team_injuries":[
         {
            "player":"Wendell Carter",
            "team":"ORL",
            "position":"C",
            "game_id":"0022200398",
            "injury":"Foot",
            "status":"Out"
         },
         {
            "player":"Gary Harris",
            "team":"ORL",
            "position":"G",
            "game_id":"0022200398",
            "injury":"Hamstring",
            "status":"Out"
         },
         {
            "player":"Jonathan Isaac",
            "team":"ORL",
            "position":"F",
            "game_id":"0022200398",
            "injury":"Knee",
            "status":"Out"
         },
         {
            "player":"Chuma Okeke",
            "team":"ORL",
            "position":"F",
            "game_id":"0022200398",
            "injury":"Knee",
            "status":"Out"
         },
         {
            "player":"Jalen Suggs",
            "team":"ORL",
            "position":"G",
            "game_id":"0022200398",
            "injury":"Ankle",
            "status":"Out"
         }
      ],
      "away_team_injuries":[
         {
            "player":"Precious Achiuwa",
            "team":"TOR",
            "position":"C",
            "game_id":"0022200398",
            "injury":"Ankle",
            "status":"Out"
         },
         {
            "player":"OG Anunoby",
            "team":"TOR",
            "position":"F",
            "game_id":"0022200398",
            "injury":"Hip",
            "status":"Out"
         },
         {
            "player":"Juancho Hernangomez",
            "team":"TOR",
            "position":"F",
            "game_id":"0022200398",
            "injury":"Ankle",
            "status":"Out"
         },
         {
            "player":"Otto Porter",
            "team":"TOR",
            "position":"F",
            "game_id":"0022200398",
            "injury":"Toe",
            "status":"Out"
         }
      ]
   },
   {
      "game_id":"0022200399",
      "date":"2022-12-11",
      "venue":"Wells Fargo Center",
      "start_time":"Final",
      "home_team_name":"Philadelphia 76ers",
      "home_team_score":"21",
      "away_team_name":"Charlotte Hornets",
      "away_team_score":"0",
      "time_left":"00:00.0",
      "home_team_id":1610612755,
      "away_team_id":1610612766,
      "odds":[
         {
            "book_name":"betmgm",
            "home_team_odds":-500,
            "away_team_odds":360,
            "home_team_opening_odds":-500,
            "away_team_opening_odds":360
         },
         {
            "book_name":"draftkings",
            "home_team_odds":-520,
            "away_team_odds":410,
            "home_team_opening_odds":-500,
            "away_team_opening_odds":400
         },
         {
            "book_name":"fanduel",
            "home_team_odds":-510,
            "away_team_odds":390,
            "home_team_opening_odds":-590,
            "away_team_opening_odds":440
         },
         {
            "book_name":"caesars",
            "home_team_odds":-556,
            "away_team_odds":400,
            "home_team_opening_odds":-556,
            "away_team_opening_odds":400
         },
         {
            "book_name":"pointsbet",
            "home_team_odds":-475,
            "away_team_odds":410,
            "home_team_opening_odds":-475,
            "away_team_opening_odds":410
         },
         {
            "book_name":"wynn",
            "home_team_odds":-556,
            "away_team_odds":420,
            "home_team_opening_odds":-500,
            "away_team_opening_odds":380
         },
         {
            "book_name":"bet_rivers_ny",
            "home_team_odds":-530,
            "away_team_odds":375,
            "home_team_opening_odds":-560,
            "away_team_opening_odds":400
         }
      ],
      "home_team_injuries":[
         {
            "player":"Danuel House",
            "team":"PHI",
            "position":"F",
            "game_id":"0022200399",
            "injury":"Foot",
            "status":"Out"
         },
         {
            "player":"Tyrese Maxey",
            "team":"PHI",
            "position":"G",
            "game_id":"0022200399",
            "injury":"Foot",
            "status":"Out"
         }
      ],
      "away_team_injuries":[
         {
            "player":"LaMelo Ball",
            "team":"CHA",
            "position":"G",
            "game_id":"0022200399",
            "injury":"Ankle",
            "status":"Out"
         },
         {
            "player":"Gordon Hayward",
            "team":"CHA",
            "position":"F",
            "game_id":"0022200399",
            "injury":"Shoulder",
            "status":"Out"
         },
         {
            "player":"Cody Martin",
            "team":"CHA",
            "position":"G",
            "game_id":"0022200399",
            "injury":"Knee",
            "status":"Out"
         },
         {
            "player":"Dennis Smith",
            "team":"CHA",
            "position":"G",
            "game_id":"0022200399",
            "injury":"Ankle",
            "status":"Out"
         },
         {
            "player":"Mark Williams",
            "team":"CHA",
            "position":"C",
            "game_id":"0022200399",
            "injury":"Ankle",
            "status":"Out"
         }
      ]
   },
   {
      "game_id":"0022200400",
      "date":"2022-12-11",
      "venue":"State Farm Arena",
      "start_time":"Final",
      "home_team_name":"Atlanta Hawks",
      "home_team_score":"4",
      "away_team_name":"Chicago Bulls",
      "away_team_score":"0",
      "time_left":"00:00.0",
      "home_team_id":1610612737,
      "away_team_id":1610612741,
      "odds":[
         {
            "book_name":"betmgm",
            "home_team_odds":-145,
            "away_team_odds":120,
            "home_team_opening_odds":-140,
            "away_team_opening_odds":115
         },
         {
            "book_name":"draftkings",
            "home_team_odds":-145,
            "away_team_odds":125,
            "home_team_opening_odds":-140,
            "away_team_opening_odds":120
         },
         {
            "book_name":"fanduel",
            "home_team_odds":-146,
            "away_team_odds":124,
            "home_team_opening_odds":-144,
            "away_team_opening_odds":124
         },
         {
            "book_name":"caesars",
            "home_team_odds":-145,
            "away_team_odds":122,
            "home_team_opening_odds":-141,
            "away_team_opening_odds":118
         },
         {
            "book_name":"pointsbet",
            "home_team_odds":-155,
            "away_team_odds":125,
            "home_team_opening_odds":-145,
            "away_team_opening_odds":115
         },
         {
            "book_name":"wynn",
            "home_team_odds":-145,
            "away_team_odds":123,
            "home_team_opening_odds":-145,
            "away_team_opening_odds":123
         },
         {
            "book_name":"bet_rivers_ny",
            "home_team_odds":-143,
            "away_team_odds":123,
            "home_team_opening_odds":-155,
            "away_team_opening_odds":125
         }
      ],
      "home_team_injuries":[
         {
            "player":"John Collins",
            "team":"ATL",
            "position":"F",
            "game_id":"0022200400",
            "injury":"Ankle",
            "status":"Out"
         },
         {
            "player":"De'Andre Hunter",
            "team":"ATL",
            "position":"F",
            "game_id":"0022200400",
            "injury":"Hip",
            "status":"Game Time Decision"
         },
         {
            "player":"Dejounte Murray",
            "team":"ATL",
            "position":"G",
            "game_id":"0022200400",
            "injury":"Ankle",
            "status":"Out"
         },
         {
            "player":"Onyeka Okongwu",
            "team":"ATL",
            "position":"C",
            "game_id":"0022200400",
            "injury":"Foot",
            "status":"Game Time Decision"
         }
      ],
      "away_team_injuries":[
         {
            "player":"Lonzo Ball",
            "team":"CHI",
            "position":"G",
            "game_id":"0022200400",
            "injury":"Knee",
            "status":"Out"
         },
         {
            "player":"Alex Caruso",
            "team":"CHI",
            "position":"G",
            "game_id":"0022200400",
            "injury":"Back",
            "status":"Out"
         },
         {
            "player":"Justin Lewis",
            "team":"CHI",
            "position":"F",
            "game_id":"0022200400",
            "injury":"Knee",
            "status":"Out For Season"
         },
         {
            "player":"Marko Simonovic",
            "team":"CHI",
            "position":"C",
            "game_id":"0022200400",
            "injury":"Illness",
            "status":"Game Time Decision"
         }
      ]
   },
   {
      "game_id":"0022200401",
      "date":"2022-12-11",
      "venue":"Toyota Center",
      "start_time":"Final",
      "home_team_name":"Houston Rockets",
      "home_team_score":"1",
      "away_team_name":"Milwaukee Bucks",
      "away_team_score":"0",
      "time_left":"00:00.0",
      "home_team_id":1610612745,
      "away_team_id":1610612749,
      "odds":[
         {
            "book_name":"betmgm",
            "home_team_odds":360,
            "away_team_odds":-500,
            "home_team_opening_odds":360,
            "away_team_opening_odds":-500
         },
         {
            "book_name":"draftkings",
            "home_team_odds":370,
            "away_team_odds":-460,
            "home_team_opening_odds":350,
            "away_team_opening_odds":-435
         },
         {
            "book_name":"fanduel",
            "home_team_odds":360,
            "away_team_odds":-460,
            "home_team_opening_odds":385,
            "away_team_opening_odds":-500
         },
         {
            "book_name":"caesars",
            "home_team_odds":360,
            "away_team_odds":-476,
            "home_team_opening_odds":345,
            "away_team_opening_odds":-455
         },
         {
            "book_name":"pointsbet",
            "home_team_odds":360,
            "away_team_odds":-420,
            "home_team_opening_odds":360,
            "away_team_opening_odds":-420
         },
         {
            "book_name":"wynn",
            "home_team_odds":380,
            "away_team_odds":-500,
            "home_team_opening_odds":350,
            "away_team_opening_odds":-455
         },
         {
            "book_name":"bet_rivers_ny",
            "home_team_odds":360,
            "away_team_odds":-500,
            "home_team_opening_odds":375,
            "away_team_opening_odds":-530
         }
      ],
      "home_team_injuries":[
         {
            "player":"Jae'Sean Tate",
            "team":"HOU",
            "position":"F",
            "game_id":"0022200401",
            "injury":"Ankle",
            "status":"Out"
         }
      ],
      "away_team_injuries":[
         {
            "player":"Joe Ingles",
            "team":"MIL",
            "position":"F",
            "game_id":"0022200401",
            "injury":"Knee",
            "status":"Out"
         },
         {
            "player":"Wesley Matthews",
            "team":"MIL",
            "position":"G",
            "game_id":"0022200401",
            "injury":"Covid-19",
            "status":"Out"
         }
      ]
   }
]"#;

        let games = serde_json::from_str::<Vec<GameWithOdds>>(str).unwrap();

        let mut injury_map: HashMap<String, Vec<InjuryStore>> = HashMap::new();
        for game in games.iter() {
            let mut inj: Vec<InjuryStore> = vec![];
            let away_inj = game.away_team_injuries.clone();
            let home_inj = game.home_team_injuries.clone();

            if let Some(injuries) = home_inj {
                injuries.into_iter().map(|i| i.into_injury_store()).for_each(|i| inj.push(i));
            }
            if let Some(injuries) = away_inj {
                injuries.into_iter().map(|i| i.into_injury_store()).for_each(|i| inj.push(i));
            }
            injury_map.insert(game.game_id.clone(), inj);
        }


        let one_hour_in_secs = 60 * 60;
        if games.is_empty()
        {
            warn!("No games found, sleeping for {} seconds", one_hour_in_secs / 60);
            actix_rt::time::sleep(std::time::Duration::from_secs(one_hour_in_secs)).await;
            continue;
        }

        let all_games_finished = games.iter().all(|g| g.is_finished());


        if !all_games_finished
        {
            let fifteen_mins_in_secs = 60 * 15;
            warn!("Not all games finished, sleeping for {} minutes", fifteen_mins_in_secs / 60);
            actix_rt::time::sleep(std::time::Duration::from_secs(fifteen_mins_in_secs)).await;
            continue;
        }

        let model_dir = std::env::var("MODEL_DIR").unwrap_or_else(|_| panic!("MODEL_DIR not set"));
        if !directory_exists(&model_dir)
        {
            panic!("MODEL_DIR does not exist");
        }

        // walk the directory and get all the models
        let models: Vec<String> = std::fs::read_dir(&model_dir).unwrap().map(|r| r.unwrap().path().file_name().unwrap().to_str().unwrap().to_string()).collect();


        for model in models
        {

            let games = games.clone();

            let prediction_url = format!("http://127.0.0.1:8080/sports/predict/all?model_name={}", model);

            let Ok(predictions) = get_t_from_source::<Vec<Prediction>>(&prediction_url).await else {
                error!("Error occurred while trying to get predictions");
                actix_rt::time::sleep(std::time::Duration::from_secs(20)).await;
                continue;
            };


            let mut pooled_conn = match pool.get() {
                Ok(con) => con,
                Err(e) => {
                    error!("Error getting connection from pool | Error: {}", e);
                    continue;
                }
            };

            let conn = pooled_conn.deref_mut();
            let save_games_structs = games.into_iter().map(|g| {
                let Some(matched_prediction) = predictions.iter().find(|p| p.game_id == g.game_id) else {
                    error!("No prediction found {} vs {}", g.home_team_name, g.away_team_name);
                    return g.into_saved_game(None, &model);
                };
                g.into_saved_game(Some(matched_prediction), &model)
            }).collect::<Vec<SavedGame>>();

            let unsaved_games = save_games_structs.into_iter().filter(|gg| {
                match gg.is_saved(conn) {
                    Ok(b) => !b,
                    Err(e) => {
                        error!("Error has occurred while checking if game is saved | Error: {}", e);
                        false
                    }
                }
            }).collect::<Vec<SavedGame>>();

            if unsaved_games.is_empty()
            {
                info!("No games to save, sleeping for 1 hour");
                actix_rt::time::sleep(std::time::Duration::from_secs(one_hour_in_secs)).await;
                continue;
            }

            let mut games_saved = 0;
            let mut injuries_saved = 0;
            let saved_games_len = unsaved_games.len();

            for game in unsaved_games
            {
                let game_saved = game.insert(conn);
                if !game_saved { error!("Failed to save {} vs {}. Will rerun in 1 hour", game.home_team_name, game.away_team_name) } else { games_saved += 1; }

                let Some(injuries) = injury_map.get(&game.game_id) else {
                    warn!("No injuries found for game {}", game.game_id);
                    continue;
                };

                for injury in injuries
                {
                    let Ok(saved) = injury.is_saved(conn) else {
                        error!("Error occurred while checking if injury is saved");
                        continue;
                    };
                    if saved { continue; }
                    let injury_saved = injury.insert(conn);
                    if !injury_saved { error!("Failed to save injury for game {}", game.game_id) } else { injuries_saved += 1; }
                }
            }

            let total_injuries = injury_map.iter().fold(0, |acc, (_, v)| acc + v.len());

            info!("Saved {}/{:?} games and {}/{:?} injuries. Sleeping for one hour.", games_saved, saved_games_len, injuries_saved, total_injuries);
        }
        actix_rt::time::sleep(std::time::Duration::from_secs(one_hour_in_secs)).await;
   }
}