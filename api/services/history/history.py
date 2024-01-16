import asyncio
import os
import time
from datetime import datetime
from multiprocessing import Event

import httpx
from loguru import logger

from api.business.model import Prediction
from api.model.games.daily_game import DailyGameResponse
from api.business.service import Service
from services.history.saver import GameSaver, GameSaverFactory, SavedGame

ONE_HOUR_IN_SECONDS = 60 * 60
FIFTEEN_MINUTES_IN_SECONDS = 60 * 15


class HistoryService(Service):
    
    async def start(self):

        while True:
            response = await self.client.get('/games/daily')

            response.raise_for_status()
            response_json = response.json()

            games: list[DailyGameResponse] = [DailyGameResponse.model_validate(game) for game in response_json]

            if len(games) == 0:
                logger.info(f"No games found for {datetime.now()}. Retrying in 1 hour")
                await asyncio.sleep(ONE_HOUR_IN_SECONDS)
                continue

            if not all(game.is_finished() for game in games):
                logger.info(f"Found {len(games)} games, but not all are finished. Retrying in 15 minutes")
                await asyncio.sleep(FIFTEEN_MINUTES_IN_SECONDS)
                continue

            logger.info(f"Found {len(games)} games, all are finished. Predicting")
            model_response = await self.client.get('/model/list')
            model_response.raise_for_status()
            models = model_response.json()
            saver: GameSaver = GameSaverFactory.compute_or_get(name='disk')
            games: list[DailyGameResponse] = saver.is_saved(games)
            print(games)
            saved_games: list[SavedGame] = []
            for model in models:
                logger.info(f"Predicting with {model}")
                predictions_response = await self.client.get(f'/model/predict/{model}')
                predictions_response.raise_for_status()
                predictions: list[Prediction] = [Prediction.model_validate(prediction) for prediction in
                                                 predictions_response.json()]
                logger.info(f"Predictions: {predictions}")
                associated_game = next((game for game in games if
                                        game.home_team.name == predictions[0].prediction or game.away_team.name ==
                                        predictions[0].prediction), None)
                if associated_game is None:
                    logger.info(f"No game found for {predictions[0].game_id}")
                    continue

                for prediction in predictions:
                    saved_games.append(SavedGame(
                        daily_game=associated_game,
                        prediction=prediction,
                        model_name=model
                    ))

            if len(saved_games) == 0:
                logger.info(f"No games found for {datetime.now()}. Retrying in 1 hour")
                await asyncio.sleep(ONE_HOUR_IN_SECONDS)
                continue

            logger.info(f"Saving {len(saved_games)} games")
            successful_saves = saver.save(saved_games)
            logger.info(f"Saved {successful_saves} games")

            logger.info(f"Done predicting, sleeping for 1 hour")
            await asyncio.sleep(ONE_HOUR_IN_SECONDS)
