from __future__ import annotations

from accuribet_service.api.v1.history import routes
from fastapi import APIRouter

router = APIRouter(prefix="/history", tags=["History"])
router.include_router(routes.router)

__all__ = ["router"]
