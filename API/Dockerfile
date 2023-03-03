FROM rust:latest AS build

WORKDIR /app
COPY ./Cargo.toml ./Cargo.lock ./
COPY ./src/ src/
RUN cargo build --release -j 32
RUN find . -type f -name libtensorflow.so.1 -exec cp {} . \; \
    && find . -type f -name libtensorflow_framework.so.1 -exec cp {} . \;

FROM debian:buster-slim

RUN apt-get update \
    && apt-get install -y \
        ca-certificates \
            libpq-dev \
    && apt-get autoremove \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY --from=build /app/target/release/sports-betting-api-rs /usr/local/bin/sports-betting-api-rs
COPY --from=build /app/*.so.1 /usr/lib/
COPY --from=build /app/src/trained_models/useable /app/trained_models/useable

ENV MODEL_DIR /app/trained_models/useable
ENV DATA_DIR /app/data
ENV LOG_LEVEL info

EXPOSE 8080
ENTRYPOINT ["sports-betting-api-rs"]