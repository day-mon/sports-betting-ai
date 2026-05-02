from __future__ import annotations

from accuribet_service.api.v1 import games, health, history
from fastapi import APIRouter

router = APIRouter(prefix="/v1")
router.include_router(health.router)
router.include_router(history.router)
router.include_router(games.router)

__all__ = ["router"]
