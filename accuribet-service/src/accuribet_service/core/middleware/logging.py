from __future__ import annotations

from typing import TYPE_CHECKING

import structlog
from starlette.middleware.base import BaseHTTPMiddleware, RequestResponseEndpoint

if TYPE_CHECKING:
    from starlette.requests import Request
    from starlette.responses import Response
    from structlog.stdlib import BoundLogger

logger: BoundLogger = structlog.get_logger(__name__)


class LoggingMiddleware(BaseHTTPMiddleware):
    async def dispatch(
        self, request: Request, call_next: RequestResponseEndpoint
    ) -> Response:
        structlog.contextvars.clear_contextvars()
        structlog.contextvars.bind_contextvars(
            method=request.method,
            path=request.url.path,
            client=request.client.host if request.client else "unknown",
        )

        await logger.ainfo(
            "request_received",
            user_agent=request.headers.get("user-agent", "-"),
        )

        response = await call_next(request)

        await logger.ainfo(
            "request_completed",
            status_code=response.status_code,
        )

        return response
