from __future__ import annotations

from accuribet_service.api.v1 import health, history
from fastapi import APIRouter

router = APIRouter(prefix="/v1")
router.include_router(health.router)
router.include_router(history.router)

__all__ = ["router"]
