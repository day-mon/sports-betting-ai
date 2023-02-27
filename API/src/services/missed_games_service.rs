use std::fs;
use std::fs::File;
use std::ops::DerefMut;
use std::thread::sleep;
use std::time::Duration;
use diesel::{PgConnection, r2d2};
use diesel::r2d2::ConnectionManager;
use polars::io::SerReader;
use polars::prelude::CsvReader;
use crate::models::game_with_odds::get_data_dates;

const TWENTY_FOUR_HOURS: Duration = Duration::from_secs(86400);

pub async fn run(
    pool: r2d2::Pool<ConnectionManager<PgConnection>>,
    model_dir: String,
    data_dir: String
) {
    loop {
        let mut pooled_connection = match pool.get() {
            Ok(conn) => conn,
            Err(error) => {
                error!("Error has occurred while trying to get a connection, Error: {error}");
                sleep(Duration::from_secs(100000));
                continue;
            }
        };

        let Ok(dates_in_fs) = fs::read_dir(&data_dir) else {
          error!("Couldnt get the the directory");
            continue;
        };
        
        let mut dates_in_fs = dates_in_fs
            .map(|file| file.unwrap().file_name())
            .collect::<Vec<String>>();
        
        let connection = pooled_connection.deref_mut();
        
        let Ok(database_date_models) = get_data_dates(connection) else {
            error!("Couldnt get the database dates");
            continue;
        };
        
        if database_date_models.is_empty() {
            info!("No database dates.. Probably a fresh start of the api.. Sleeping for 24 hours");
            sleep(TWENTY_FOUR_HOURS)
        }
        
        
        let Some(database_dates) = database_date_models.first() else {
            error!("Couldnt get first element after we cleared the possibility of the list being empty?");
            continue;
        };
        
        dates_in_fs.retain(|fs_date| !database_dates.dates.contains(fs_date));
        
        if dates_in_fs.is_empty() {
            info!("No games missing. Sleeping for 24 hours");
            sleep(TWENTY_FOUR_HOURS);
            continue;
        }
        
        for date in dates_in_fs {
            let file_name = format!("{data_dir}/{date}.csv");
            let file= match File::open(file_name)  {
                Ok(f) => f,
                Err(error) => {
                    error!("Error has occurred while trying to acquire the file in directory ({file_name}), Error here: {error}");
                    continue
                }
            };
            
            let dataframe = CsvReader::new(file)
                .has_header(true)
                .finish()
                .unwrap();
            
            
            
        }
    }
}