#!/usr/bin/env bash

cd API || exit
if [ ! -d target ]; then
  echo "Building API"
  cargo build -j 32 --release
fi

RUNNING=$(lsof -i:8000 | grep -c LISTEN)
echo "API running: $RUNNING"
if [ "$RUNNING" -eq 0 ]; then
  echo "Starting API"
  cargo run --bin sports-betting-api-rs &
fi
cd .. || exit


cd Website || exit
if [ ! -d node_modules ]; then
  echo "Installing Website"
  npm install
fi

RUNNING=$(pgrep "node" |  wc -l)
if [ "$RUNNING" -eq 0 ]; then
  echo "Starting Website"
  npm run dev &
fi

echo "Done"

cd .. || exit



