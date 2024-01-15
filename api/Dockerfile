# Dockerfile-api
FROM python:3.11.0-slim

WORKDIR /app

COPY ./api /app/api
COPY poetry.lock pyproject.toml /app/

RUN pip install poetry
RUN poetry config virtualenvs.create false
RUN poetry install --no-dev

CMD ["python", "/app/api/main.py"]