from fastapi import APIRouter

router = APIRouter(
    prefix="/ping",
    tags=["ping"]
)


@router.get("/")
async def pong():
    return "pong"
