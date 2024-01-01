from fastapi import APIRouter
from starlette.responses import Response

router = APIRouter(prefix="/ping", tags=["Ping"])


@router.get(
    "",
    summary="Ping endpoint",
    description="Simple ping endpoint to check if the API is up",
    status_code=204,
)
async def pong():
    return Response(status_code=204)
