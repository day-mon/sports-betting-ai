FROM rust:latest AS build

WORKDIR /app
COPY ./Cargo.toml ./Cargo.lock ./
COPY ./src src/
RUN cargo build --release
RUN find . -type f -name libtensorflow.so.1 -exec cp {} . \; \
    && find . -type f -name libtensorflow_framework.so.1 -exec cp {} . \;

# echo yes if libtensorflow.so.1 and no if libtensorflow_framework.so.1 is not found
RUN find . -type f -name libtensorflow.so.1 -exec echo FOUND=yes \; \
    && find . -type f -name libtensorflow_framework.so.1 -exec export FOUND=no \;

RUN if [ "$FOUND" = "yes" ]; then \
        echo "libtensorflow.so.1 found"; \
    else \
        echo "libtensorflow.so.1 not found"; \
    fi

FROM debian:buster-slim

RUN apt-get update \
    && apt-get install -y \
        ca-certificates \
    && apt-get autoremove \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app
RUN ls -all
COPY --from=build /app/target/release/sports-betting-api-rs /usr/local/bin/sports-betting-api-rs
COPY --from=build /app/libtensorflow.so.1 /usr/local/lib/libtensorflow.so.1
#COPY --from=build /app/*.so.1 /usr/lib/

RUN useradd -mU -s /bin/bash actix
USER actix

EXPOSE 8080
ENTRYPOINT ["sports-betting-ai-rs"]
