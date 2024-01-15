# Use the official Python 3.11 image as a base image
FROM python:3.11.0-slim

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy the pyproject.toml and poetry.lock files to the container
COPY pyproject.toml poetry.lock ./

# Install Poetry for dependency management
RUN pip install --no-cache-dir poetry

# Disable the creation of a virtual environment since we are in Docker
RUN poetry config virtualenvs.create false

# Install the project dependencies
RUN poetry install --no-dev --no-interaction --no-ansi

# Copy the rest of the application source code to the container
COPY services/ ./

# Expose the port the app runs on
EXPOSE 8000

# Command to run the application
CMD ["python", "main.py"]