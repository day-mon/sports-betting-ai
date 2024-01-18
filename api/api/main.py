import json
import os
import time
import uuid
from contextlib import asynccontextmanager

from fastapi import FastAPI, Depends
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from loguru import logger
from starlette.requests import Request
from starlette.responses import JSONResponse

from api.business.database import DatabaseFactory
from api.routes import games, model, ping

import httpx
import tomli
import uvicorn

from resources.config.database import get_database_settings

BASE_PATH = "/api/v1"

with open("pyproject.toml", "rb") as f:
    _META = tomli.load(f)

app = FastAPI(
    title="Accuribet API",
    description="API that serves predictions for Sports Games",
    version=_META["tool"]["poetry"]["version"],
    openapi_url=f"{BASE_PATH}/openapi.json",
    docs_url=f"{BASE_PATH}/docs",
    redoc_url=f"{BASE_PATH}/redoc",
    responses={
        422: {
            "description": "Validation Error",
            "content": {
                "application/json": {
                    "example": {
                        "message": "Yeah theres seems to be something wrong with your request, check the errors field "
                                   "for more info",
                        "detail": "Validation Error",
                        "errors": ["List of errors"],
                    }
                }
            },
        },
        424: {
            "description": "Dependency Failed Error",
            "content": {
                "application/json": {
                    "example": {
                        "message": "Opps! Something went wrong on a dependency, check the errors field for more info",
                        "detail": "Dependency Failed Error",
                        "dependency": {
                            "name": "Name of the dependency",
                            "url": "URL of the dependency",
                            "response": "Response from the dependency",
                        },
                    }
                }
            },
        },
    },
)


@asynccontextmanager
async def lifespan(_: FastAPI):
    db_settings = get_database_settings()
    logger.info(f"Connecting to {db_settings.DATABASE_TYPE}")
    db = DatabaseFactory.compute_or_get(
        name=db_settings.DATABASE_TYPE,
    )
    await db.connect()
    yield
    await db.disconnect()


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


async def log_body(request: Request):
    body = await request.body()
    request.state.body = body


@app.exception_handler(httpx.HTTPStatusError)
async def httpx_status_error_handler(_: Request, exc: httpx.HTTPStatusError):
    return JSONResponse(
        status_code=424,
        content={
            "message": "Opps! Something went wrong on a dependency, check the errors field for more info",
            "detail": "Dependency Failed Error",
            "dependency": {
                "name": exc.request.url.host,
                "url": exc.request.url,
                "response": exc.response.json(),
            },
        },
    )


@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    body = request.state.body.decode("utf-8")
    body = body if body else None

    json_log = {
        "request": {
            "id": request.state.id,
            "method": request.method,
            "url": request.url.path,
            "headers": dict(request.headers),
            "body": body,
        },
        "exception": {
            "type": exc.__class__.__name__,
            "message": str(exc),
        },
    }

    logger.error(
        json.dumps(json_log, indent=4, sort_keys=True, default=str),
    )

    return JSONResponse(
        status_code=500,
        content={
            "message": "Opps! Something went wrong on our end, check the errors field for more info",
            "detail": "Internal Server Error",
            "errors": [],
        },
    )


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(_request: Request, exc: RequestValidationError):
    errors = exc.errors()
    error_messages = []

    for error in errors:
        field_path = "->".join(map(str, error["loc"]))
        message = error["msg"]
        error_messages.append(f"{field_path}: {message}")

    return JSONResponse(
        status_code=424,
        content={
            "message": "Yeah theres seems to be something wrong with your request, check the errors field for more info",
            "detail": "Validation Error",
            "errors": error_messages,
        },
    )


@app.middleware("http")
async def log(request: Request, call_next):
    request_start_time = time.time()
    request.state.id = uuid.uuid4().hex[:5]
    response = await call_next(request)
    request_processing_time = time.time() - request_start_time
    response.headers["X-Process-Time"] = str(request_processing_time)
    response.headers["X-Request-ID"] = request.state.id
    user_agent = request.headers.get("user-agent")
    cf_real_ip = request.headers.get("x-real-ip", "")
    forwarded_for = request.headers.get("x-forwarded-for", "")

    logger.info(
        f"[{request.state.id}] {request.method} {request.url.path} {response.status_code}  {user_agent} {cf_real_ip} {forwarded_for} {request_processing_time:.3f}"
    )

    return response


routers = [games.router, model.router, ping.router]
for router in routers:
    app.include_router(router, prefix=BASE_PATH, dependencies=[Depends(log_body)])

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, access_log=False, reload=True)
