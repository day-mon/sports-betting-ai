from importlib import metadata

import fastapi
from accuribet_service.api.v1.health.schemas import HealthResponse

router = fastapi.APIRouter()


@router.get(
    "/",
    summary="Health Check",
    status_code=fastapi.status.HTTP_200_OK,
    response_model=HealthResponse,
)
async def health_check() -> HealthResponse:
    return HealthResponse(
        status="ok",
        version=metadata.version("accuribet_service"),
    )
