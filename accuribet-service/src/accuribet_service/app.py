import typing
from importlib import metadata

import fastapi
from accuribet_service.api.v1 import router as v1_router
from accuribet_service.config.app import settings
from accuribet_service.core import error_handlers
from accuribet_service.core.lifecycle import lifecycle
from accuribet_service.core.logging import configure_logging
from accuribet_service.core.middleware import LoggingMiddleware, TimingMiddleware
from asgi_correlation_id import CorrelationIdMiddleware

if typing.TYPE_CHECKING:
    from fastapi.applications import FastAPI


def create_app() -> "FastAPI":
    configure_logging(json_logs=settings.is_json_logs, log_level=settings.log_level)

    app = fastapi.FastAPI(
        title="Accuribet Service",
        version=metadata.version("accuribet_service"),
        lifespan=lifecycle,
        docs_url="/api/docs",
        openapi_url="/api/openapi.json",
    )

    @app.get("/")
    async def docs_redirect() -> fastapi.responses.RedirectResponse:
        return fastapi.responses.RedirectResponse(url="/api/docs")

    app.add_middleware(TimingMiddleware)
    app.add_middleware(LoggingMiddleware)
    app.add_middleware(CorrelationIdMiddleware)

    error_handlers.register(app)

    app.include_router(v1_router)

    return app


app = create_app()
