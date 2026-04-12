from __future__ import annotations

import time
from typing import TYPE_CHECKING

import structlog
from starlette.middleware.base import BaseHTTPMiddleware, RequestResponseEndpoint

if TYPE_CHECKING:
    from starlette.requests import Request
    from starlette.responses import Response

logger: structlog.stdlib.BoundLogger = structlog.get_logger(__name__)


class TimingMiddleware(BaseHTTPMiddleware):
    async def dispatch(
        self, request: Request, call_next: RequestResponseEndpoint
    ) -> Response:
        start_time = time.perf_counter()
        response = await call_next(request)
        process_time = time.perf_counter() - start_time

        response.headers["X-Process-Time"] = f"{process_time:.4f}s"

        await logger.adebug(
            "request_timing",
            method=request.method,
            path=request.url.path,
            duration_ms=round(process_time * 1000, 2),
        )

        return response
