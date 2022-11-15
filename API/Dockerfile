FROM lukemathwalker/cargo-chef:latest-rust-1.65-buster as server_builder

# this is silly but it works

WORKDIR /app
COPY . ./
RUN cargo build --color=always --message-format=json-diagnostic-rendered-ansi --package sports-betting-api-rs --bin sports-betting-api-rs --release
EXPOSE 8080
ENTRYPOINT ["cargo",  "run", "--color=always", "--package", "sports-betting-api-rs", "--bin",  "sports-betting-api-rs"]
