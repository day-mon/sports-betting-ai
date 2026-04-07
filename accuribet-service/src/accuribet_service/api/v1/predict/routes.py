import fastapi

router = fastapi.APIRouter(
    prefix="/predict",
)

@router.get("")
async def predict():
    ...

