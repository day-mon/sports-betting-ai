import importlib

import fastapi
from accuribet_service.core.lifecycle import lifecycle


def create_app() -> fastapi.FastAPI:
    app = fastapi.FastAPI(
        title="Accuribet Service",
        version=importlib.metadata.version("accuribet_service"),
        lifespan=lifecycle,
    )

    return app


app = create_app()
