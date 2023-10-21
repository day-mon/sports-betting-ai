## Requirements before running the app
- Because of CORS we use a Cloudflare worker to get the data. This means that you need to have a Cloudflare account and a worker. You can either use the code below or whats in worker.js its the same.
```javascript
/*
This is the cloudflare worker that runs to get the CSV data from the NBA API.
We use this to get the data because the NBA API does not allow CORS and after a second request is made the api will not give us a response.

This is generally called once a day and then saved in wherever DATA_DIR is defined to.
*/

export default {
    async fetch(request, env) {
        return await handleRequest(request)
    }
}

async function handleRequest(request) {
    const url = 'https://stats.nba.com/stats/leaguedashteamstats?Conference=&DateFrom=&DateTo=&Division=&GameScope=&GameSegment=&Height=&LastNGames=0&LeagueID=00&Location=&MeasureType=Base&Month=0&OpponentTeamID=0&Outcome=&PORound=0&PaceAdjust=N&PerMode=PerGame&Period=0&PlayerExperience=&PlayerPosition=&PlusMinus=N&Rank=N&Season=2022-23&SeasonSegment=&SeasonType=Regular%20Season&ShotClockRange=&StarterBench=&TeamID=0&TwoWay=0&VsConference=&VsDivision='
    const options = {
        method: 'GET',
        headers: {
            'Accept': '*/*',
            'Accept-Encoding': 'gzip, deflate, br',
            'Accept-Language': 'en-US,en;q=0.9',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
            'Host': 'stats.nba.com',
            'Origin': 'https://www.nba.com',
            'Pragma': 'no-cache',
            'Referer': 'https://www.nba.com/',
            'Sec-Fetch-Dest': 'empty',
            'Sec-Fetch-Mode': 'cors',
            'Sec-Fetch-Site': 'same-site',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/107.0.0.0 Safari/537.36',
            'sec-ch-ua': '"Google Chrome";v="107", "Chromium";v="107", "Not=A?Brand";v="24"',
            'sec-ch-ua-mobile': '?0',
            'sec-ch-ua-platform': '"Windows"'
        }
    };
    const response = await fetch(url, options);
    const results = await gatherResponse(response);
    return new Response(results, options);
}

async function gatherResponse(response) {
    const { headers } = response;
    const contentType = headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
        return JSON.stringify(await response.json());
    }
    return response.text();
}
```


## Environment variables
- `DATABASE_URL` - The URL of the database. This is used for saving Historical data.
- `MODEL_DIR` - The directory where the model is stored. This is used for loading the model.
- `DATA_DIR` - The directory where the data is stored. This is used for loading the data.
- `MISSED_GAMES_SERVICE` - A boolean value that determines if the missed games service should run. This is used for games that may have been missed and have a CSV file for them.
- `WORKER_URL` - The URL of the Cloudflare worker that gets the CSV data from the NBA API.

## Getting started with Docker

This is a quick guide to get you started with Docker. 

### Prerequisites
- [Docker](https://docs.docker.com/get-docker/)
- A relational database. This can be any database that is supported by [Diesel](https://diesel.rs/guides/getting-started/). This is used for saving historical data.



## Running the app
- With docker run you can do the following:
```shell
docker run -p 8080:8080 -e DATABASE_URL=postgres://user:password@host:port/database -d --name app app
```

## Getting Started without Docker
***You may need the postgres dev libraries installed on your system. This is needed for Diesel to compile.***

### Arch
```shell
sudo pacman -S postgresql-libs
```

### MacOS
```shell
brew install libpq
brew link --force libpq
```

## Running the app
- Install the dependencies
```shell
cargo build -r
```

- Run the app
```shell
cd target/release
./app
```

## Contributing
- Fork the repo
- Create a new branch
- Make your changes
- Create a pull request