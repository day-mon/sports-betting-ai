from accuribet_service.api.v1 import health
from fastapi import APIRouter

router = APIRouter(prefix="/v1")
router.include_router(health.router)

__all__ = ["router"]
