# Use the old image as the base
FROM ghcr.io/day-mon/sports-betting-ai/api:main

# Install the cargo command
RUN apt-get update \
  && apt-get install -y cargo \
  && apt-get autoremove \
  && apt-get clean \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY ./Cargo.toml ./Cargo.lock ./
COPY ./src/ src/


# Check if there are any new dependencies
RUN cargo check

# If cargo check returned with errors, it means that there are new dependencies
# and we need to rebuild them. Otherwise, we can skip rebuilding the dependencies.
RUN if [ $? -ne 0 ]; then \
      cargo build --release -j 32; \
    fi

# Copy the TensorFlow libraries from the old image to the current image
RUN find . -type f -name libtensorflow.so.1 -exec cp {} . \; \
    && find . -type f -name libtensorflow_framework.so.1 -exec cp {} . \;

# Install the required system packages
RUN apt-get update \
    && apt-get install -y \
        ca-certificates \
            libpq-dev \
    && apt-get autoremove \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Set the environment variables and expose the required port
ENV MODEL_DIR /app/model
ENV DATA_DIR /app/data
EXPOSE 8080

# Set the entrypoint to the sports-betting-api-rs binary
ENTRYPOINT ["sports-betting-api-rs"]
