## Getting started with Docker

This is a quick guide to get you started with Docker. 

### Prerequisites
- [Docker](https://docs.docker.com/get-docker/)
- [Docker Compose](https://docs.docker.com/compose/install/)

## Environment variables
- `DATABASE_URL` - The URL of the database. This is used for saving Historical data.

## Running the app
- With docker run you can do the following:
```shell
docker run -p 8080:8080 -e DATABASE_URL=postgres://user:password@host:port/database -d --name app app
```

## Getting Started without Docker
- Install the dependencies
```shell
cargo build -j <NUM_OF_CPU_JOBS> --release
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
