import json
from typing import Any, Optional

from fastapi import APIRouter, Depends
from loguru import logger
from pandas import DataFrame
from starlette.exceptions import HTTPException

from api.business.cache import CacheFactory
from api.business.daily_games import DailyGameFactory, DailyGame
from api.business.database import DatabaseFactory, Database
from api.business.model import PredictionModelFactory, PredictionModel, Prediction
from api.model.model.accuracy import AccuracyModel
from api.model.model.date_model import DateModel
from api.utils.daily_game import get_cache_key
from resources.config.application import AppSettings, get_settings
from resources.config.cache import CacheSettings, get_cache_settings
from resources.config.database import DatabaseSettings, get_database_settings

router = APIRouter(prefix="/model", tags=["Model"])


@router.get(
    "/list",
    summary="Lists all available models",
    description="Lists all available models",
    response_model=list[str],
)
async def list_models() -> list[str]:
    return PredictionModelFactory.keys()


@router.get(
    "/predict/{name}",
    summary="Predicts the outcome of a sports game",
    description="Predicts the outcome of a Sports game given a model, will serve from cache if available",
    response_model=list[Prediction],
    responses={
        200: {"description": "Returns predictions for the given model"},
        404: {"description": "Either the model or the games were not found"},
    },
)
async def predict(
    name: str,
    app_settings: AppSettings = Depends(get_settings),
    cache_setting: CacheSettings = Depends(get_cache_settings),
) -> list[Prediction]:
    if name not in PredictionModelFactory.keys():
        logger.debug(f"Requested {app_settings.MODEL_DIR}/{name}")
        raise HTTPException(status_code=404, detail=f"Model {name} not found")

    games = DailyGameFactory.compute_or_get(
        name=app_settings.DAILY_GAMES_SOURCE,
    )

    daily_games: list[DailyGame] = await games.fetch()
    if len(daily_games) == 0:
        raise HTTPException(status_code=404, detail=f"No games found")

    logger.debug(f"Caching is set to {cache_setting.CACHE_TYPE}")

    if cache_setting.cache_enabled:
        cache_key = get_cache_key(daily_games, name)
        logger.debug(f"Using cache key {cache_key}")
        cache = CacheFactory.compute_or_get(
            name=cache_setting.CACHE_TYPE,
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
        name=name,
        model_name=name,
        model_dir=app_settings.MODEL_DIR,
    )

    stats: DataFrame = await prediction_model.fetch_stats(daily_games=daily_games)
    predictions: list[Prediction] = await prediction_model.predict(data=stats)
    if cache_setting.cache_enabled:
        cache_key = get_cache_key(daily_games, name)
        logger.debug(f"Setting with key {cache_key}")
        cache = CacheFactory.compute_or_get(
            name=cache_setting.CACHE_TYPE,
        )
        predictions_json = [prediction.model_dump() for prediction in predictions]
        predictions_json = json.dumps(predictions_json)
        await cache.set(cache_key, predictions_json)

    return predictions


@router.get("/accuracy/{name}")
async def history(
    name: str,
    app_settings: AppSettings = Depends(get_settings),
    db_settings: DatabaseSettings = Depends(get_database_settings),
) -> AccuracyModel:
    model_names: list[str] = PredictionModelFactory.keys()
    if name not in model_names:
        raise HTTPException(status_code=404, detail=f"Model {name} not found")

    db: Database = DatabaseFactory.compute_or_get(
        name=db_settings.DATABASE_TYPE,
    )

    model = PredictionModelFactory.compute_or_get(
        name=name,
        model_name=name,
        model_dir=app_settings.MODEL_DIR,
    )

    return await AccuracyModel.from_db(
        model=model,
        db=db,
    )


@router.get("/history/dates")
async def history_dates(
    db_settings: DatabaseSettings = Depends(get_database_settings),
) -> list[DateModel]:
    db: Database = DatabaseFactory.compute_or_get(
        name=db_settings.DATABASE_TYPE,
    )

    model_names: list[str] = PredictionModelFactory.keys()

    dates = await DateModel.from_db(
        models=model_names,
        db=db,
    )

    return dates
