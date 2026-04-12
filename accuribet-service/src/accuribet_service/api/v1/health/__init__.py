from accuribet_service.api.v1.health import routes
from fastapi import APIRouter

router = APIRouter(prefix="/health", tags=["Health"])
router.include_router(routes.router)

__all__ = ["router"]
