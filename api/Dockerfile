FROM python:3.11.0-slim as python-base

WORKDIR  /api
COPY /pyproject.toml /api
RUN pip3 install poetry==1.7.1
RUN poetry config virtualenvs.create false
RUN touch README.md
RUN poetry install --only main,api

ENV LOGURU_LEVEL=INFO
COPY . .
ENTRYPOINT ["uvicorn", "api.main:app", "--host", "0.0.0.0", "--port", "8080", "--workers" , "3", "--no-access-log"]