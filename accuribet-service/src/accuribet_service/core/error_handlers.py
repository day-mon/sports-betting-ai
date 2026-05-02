"""Global exception handlers for the application."""

from __future__ import annotations

import typing

import aiohttp
import structlog
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse

if typing.TYPE_CHECKING:
    import fastapi
    from starlette.requests import Request
    from starlette.responses import Response

logger = structlog.get_logger(__name__)


def _error_response(
    request: Request,
    exc: Exception,
    status_code: int,
    message: str,
    detail: str,
    **context: object,
) -> JSONResponse:
    """Build a standardized error response and log it.

    All API errors follow this shape:
    {
        "message": "human readable description",
        "detail": "ErrorCategory",
        ...context-specific fields
    }
    """
    payload: dict[str, object] = {
        "message": message,
        "detail": detail,
    }
    payload.update(context)

    logger.error(
        "api_error",
        status_code=status_code,
        detail=detail,
        message=message,
        url=str(request.url),
        method=request.method,
        exc_type=exc.__class__.__name__,
        exc_message=str(exc),
    )

    return JSONResponse(status_code=status_code, content=payload)


def handle_aiohttp_response_error(
    request: Request,
    exc: Exception,
) -> Response:
    """Handle aiohttp client response errors as 424 Failed Dependency."""
    client_exc = typing.cast("aiohttp.ClientResponseError", exc)
    return _error_response(
        request=request,
        exc=exc,
        status_code=424,
        message="Something went wrong on a dependency, check the errors field for more info",
        detail="Dependency Failed Error",
        dependency={
            "name": client_exc.request_info.url.host,
            "url": str(client_exc.request_info.url),
            "status": client_exc.status,
            "response": {"message": client_exc.message},
        },
    )


def handle_validation_error(
    request: Request,
    exc: Exception,
) -> Response:
    """Handle FastAPI request validation errors as 422."""
    validation_exc = typing.cast("RequestValidationError", exc)
    error_messages = [
        f"{'->'.join(map(str, error['loc']))}: {error['msg']}" for error in validation_exc.errors()
    ]
    return _error_response(
        request=request,
        exc=exc,
        status_code=422,
        message="There seems to be something wrong with your request, check the errors field for more info",
        detail="Validation Error",
        errors=error_messages,
    )


def handle_general_exception(
    request: Request,
    exc: Exception,
) -> Response:
    """Handle uncaught exceptions as 500 Internal Server Error."""
    return _error_response(
        request=request,
        exc=exc,
        status_code=500,
        message="Oops! Something went wrong on our end, check the errors field for more info",
        detail="Internal Server Error",
        errors=[],
    )


def register(app: fastapi.FastAPI) -> None:
    """Register all global exception handlers on the FastAPI app."""
    app.add_exception_handler(aiohttp.ClientResponseError, handle_aiohttp_response_error)
    app.add_exception_handler(RequestValidationError, handle_validation_error)
    app.add_exception_handler(Exception, handle_general_exception)
