import time

from fastapi import FastAPI, Depends
import uvicorn
from loguru import logger
import uuid
from starlette.requests import Request
from api.routes import games, model, ping
import os
os.environ["TF_CPP_MIN_LOG_LEVEL"] = "2"
BASE_PATH = "/api/v1"


app = FastAPI(
    title="Accuribet API",
    description="API that serves predictions for Sports Games",
    version="0.1.0",
    openapi_url=f"{BASE_PATH}/openapi.json",
    docs_url=f"{BASE_PATH}/docs",
    redoc_url=f"{BASE_PATH}/redoc",

)


async def log_body(request: Request):
    body = await request.body()
    request.state.body = body

@app.middleware("http")
async def log(request: Request, call_next):
    request_start_time = time.time()
    request.state.id = uuid.uuid4().hex
    response = await call_next(request)
    request_processing_time = time.time() - request_start_time
    response.headers["X-Process-Time"] = str(request_processing_time)
    response.headers["X-Request-ID"] = request.state.id
    logger.info(f"{request.method } {request.url.path} {response.status_code} {request_processing_time:.3f}")
    return response

routers = [games.router, model.router, ping.router]
for router in routers:
    app.include_router(router, prefix=BASE_PATH, dependencies=[Depends(log_body)])

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000,  reload=True)


