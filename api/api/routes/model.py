import os

import httpx
from fastapi import APIRouter, Depends
from loguru import logger
from pandas import DataFrame
from starlette.exceptions import HTTPException

from api import constants
from api.business.cache import CacheFactory
from api.business.daily_games import DailyGameFactory, DailyGame
from api.business.model import PredictionModelFactory, PredictionModel, Prediction
from api.config.application import AppSettings
from api.config.application import get_settings
from api.utils.daily_game import get_cache_key

router = APIRouter(
    prefix="/model",
    tags=["model"]
)
client = httpx.AsyncClient()


@router.get("/predict/{model_name}")
async def predict(
    model_name: str,
    settings: AppSettings = Depends(get_settings),
) -> list[Prediction]:
    if not os.path.exists(f"{settings.MODEL_DIR}/{model_name}"):
        logger.debug(f"Requested {settings.MODEL_DIR}/{model_name}")
        raise HTTPException(status_code=404, detail=f"Model {model_name} not found")

    games = DailyGameFactory.compute_or_get(
        name=settings.DAILY_GAMES_SOURCE,
    )

    daily_games: list[DailyGame] = await games.fetch()
    if len(daily_games) == 0:
        raise HTTPException(status_code=404, detail=f"No games found")

    if settings.REDIS_URL:
        cache_key = get_cache_key(daily_games, model_name)
        logger.debug(f"Using cache key {cache_key}")
        cache = CacheFactory.compute_or_get(settings.REDIS_URL)
        cached_predictions: list[Prediction] = cache.get(cache_key)
        if cached_predictions:
            logger.debug(f"Using cached predictions for {cache_key}")
            return cached_predictions

    prediction_model: PredictionModel = PredictionModelFactory.compute_or_get(
        name=model_name,
        model_name=model_name,
        model_dir=settings.MODEL_DIR,
    )

    stats: DataFrame = prediction_model.fetch_stats(
        daily_games=daily_games
    )
    predictions: list[Prediction] = prediction_model.predict(data=stats)
    if settings.REDIS_URL:
        cache_key = get_cache_key(daily_games, model_name)
        logger.debug(f"Using cache key {cache_key}")
        cache = CacheFactory.compute_or_get(settings.REDIS_URL)
        cache.set(cache_key, predictions)

    return predictions


@router.get("/history{name}")
async def history():
    return {"message": "History"}


@router.get("/history/dates")
async def history_dates():
    return {"message": "History dates"}
