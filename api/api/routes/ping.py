from fastapi import APIRouter
from starlette.responses import Response

router = APIRouter(
    prefix="/ping",
    tags=["Ping"]
)


@router.get("/")
async def pong():
    return Response(status_code=204)
