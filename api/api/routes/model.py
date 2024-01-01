import json
import os
from typing import Any, Optional

from fastapi import APIRouter, Depends
from loguru import logger
from pandas import DataFrame
from starlette.exceptions import HTTPException

from api.business.cache import CacheFactory
from api.business.daily_games import DailyGameFactory, DailyGame
from api.business.model import PredictionModelFactory, PredictionModel, Prediction
from api.config.application import AppSettings
from api.config.application import get_settings
from api.config.cache import CacheSettings, get_cache_settings
from api.utils.daily_game import get_cache_key

router = APIRouter(prefix="/model", tags=["Model"])


@router.get(
    "/predict/{model_name}",
    summary="Predicts the outcome of a sports game",
    description="Predicts the outcome of a Sports game given a model, will serve from cache if available",
    response_model=list[Prediction],
    responses={
        200: {"description": "Returns predictions for the given model"},
        404: {"description": "Either the model or the games were not found"},
    },
)
async def predict(
    model_name: str,
    app_settings: AppSettings = Depends(get_settings),
    cache_setting: CacheSettings = Depends(get_cache_settings),
) -> list[Prediction]:
    if model_name not in PredictionModelFactory.keys():
        logger.debug(f"Requested {app_settings.MODEL_DIR}/{model_name}")
        raise HTTPException(status_code=404, detail=f"Model {model_name} not found")

    games = DailyGameFactory.compute_or_get(
        name=app_settings.DAILY_GAMES_SOURCE,
    )

    daily_games: list[DailyGame] = await games.fetch()
    if len(daily_games) == 0:
        raise HTTPException(status_code=404, detail=f"No games found")

    logger.debug(f"Caching is set to {cache_setting.TYPE}")

    if cache_setting.TYPE != "none":
        cache_key = get_cache_key(daily_games, model_name)
        logger.debug(f"Using cache key {cache_key}")
        cache = CacheFactory.compute_or_get(
            name=cache_setting.TYPE,
        )
        cached_predictions: Optional[str] = await cache.get(cache_key)
        if cached_predictions:
            cached_predictions: list[dict[str, Any]] = json.loads(cached_predictions)
            cached_predictions: list[Prediction] = [
                Prediction.model_validate(prediction)
                for prediction in cached_predictions
            ]
            logger.debug(f"Using cached predictions for {cache_key}")
            return cached_predictions

    prediction_model: PredictionModel = PredictionModelFactory.compute_or_get(
        name=model_name,
        model_name=model_name,
        model_dir=app_settings.MODEL_DIR,
    )

    stats: DataFrame = prediction_model.fetch_stats(daily_games=daily_games)
    predictions: list[Prediction] = await prediction_model.predict(data=stats)
    if cache_setting.TYPE != "none":
        cache_key = get_cache_key(daily_games, model_name)
        logger.debug(f"Setting with key {cache_key}")
        cache = CacheFactory.compute_or_get(
            name=cache_setting.TYPE,
        )
        predictions_json = [prediction.model_dump() for prediction in predictions]
        predictions_json = json.dumps(predictions_json)
        await cache.set(cache_key, predictions_json)

    return predictions


@router.get("/history/{name}")
async def history():
    return {"message": "History"}


@router.get("/history/dates")
async def history_dates():
    return {"message": "History dates"}
