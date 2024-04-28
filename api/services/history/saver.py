import json
import os
from abc import ABC, abstractmethod

import asyncpg
from loguru import logger
from pydantic import BaseModel, ConfigDict

from api.business.database import DatabaseFactory, Postgres
from api.business.factory import AbstractFactory, FactoryItem
from api.business.model import Prediction
from api.model.games.daily_game import DailyGame, DailyGameResponse
from resources.config.database import get_database_settings


class SavedGame(BaseModel):
    daily_game: DailyGameResponse
    prediction: Prediction
    model_name: str

    @property
    def winner(self):
        if self.daily_game.home_team.score > self.daily_game.away_team.score:
            return self.daily_game.home_team.name
        return self.daily_game.away_team.name

    model_config = ConfigDict(
        protected_namespaces=()
    )


class GameSaver(ABC):
    @abstractmethod
    async def save(self, games: list[SavedGame]) -> int:
        """
        Saves a game to a datastore

        :param games: DailyGame object
        :return: int representing the number of games saved
        """

    @abstractmethod
    async def unsaved(self,
                      games: list[DailyGameResponse],
                      model_name: str
                      ) -> list[DailyGameResponse]:
        """
        Checks if a game is already saved
        :param list[DailyGameResponse] games: DailyGame object
        :param str model_name: Model name
        :return list[DailyGameResponse]: Returns a list of games that are not saved
        """


class DiskBasedGameSaver(GameSaver):
    async def save(self, games: list[SavedGame]) -> int:
        """
        Saves a game to a datastore

        :param games: DailyGame object
        :return: int representing the number of games saved
        """
        directory = '/tmp/nba-predictions'
        if not os.path.exists(directory):
            os.makedirs(directory)

        date = games[0].daily_game.date.replace("-", "")
        with open(f"{directory}/{date}.json", "w") as f:
            content_dumped = json.dumps([game.model_dump() for game in games])
            f.write(content_dumped)

        return len(games)

    async def unsaved(self, games: list[DailyGameResponse], model_name: str) -> list[DailyGameResponse]:
        """
        Gets a list of unsaved games from source list

        :param games: DailyGame object
        :return: bool representing if the game is saved
        """
        directory = '/tmp/nba-predictions'
        if not os.path.exists(directory):
            os.makedirs(directory)

        date = games[0].date.replace("-", "")
        if not os.path.exists(f"{directory}/{date}.json"):
            return games

        with open(f"{directory}/{date}.json", "r") as f:
            saved_games = f.read()
            saved_games = json.loads(saved_games)

        saved_games = [SavedGame.model_validate(game) for game in saved_games]
        saved_game_ids = [game.daily_game.id for game in saved_games]
        return [game for game in games if game.id not in saved_game_ids]


class PostgresBasedGameSaver(GameSaver):
    db: Postgres

    def __init__(self):
        self.db = DatabaseFactory.compute_or_get(
            name="postgres"
        )

    async def save(self, games: list[SavedGame]) -> int:
        """
        Saves a game to a datastore

        :param game: DailyGame object
        :return: int representing the number of games saved
        """
        saved_games = []
        for game in games:
            try:
                response = await self.db.query("""
                INSERT into saved_games (game_id, home_team_name, home_team_score, away_team_name, away_team_score, winner, prediction, date, confidence) 
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
                
                RETURNING game_id
                """, [
                    game.daily_game.id,
                    game.daily_game.home_team.name,
                    str(game.daily_game.home_team.score),
                    game.daily_game.away_team.name,
                    str(game.daily_game.away_team.score),
                    game.winner,
                    game.prediction.prediction,
                    game.daily_game.date,
                    str(game.prediction.confidence) if game.prediction.confidence is not None else None
                ])
            except asyncpg.exceptions.UniqueViolationError as e:
                logger.error(f"Game {game.daily_game.id} already saved")
                continue

            if len(response) == 1:
                saved_games.append(game)

        logger.info(f"Saved {len(saved_games)}/{len(games)}")
        return len(saved_games)

    async def unsaved(self, games: list[DailyGameResponse], model_name: str
                      ) -> list[DailyGameResponse]:
        """
        Checks if a game is already saved

        :param games: DailyGame object
        :return: list[DailyGameResponse]: Returns a list of games that are not saved
        """
        saved_games: list[DailyGameResponse] = []
        for game in games:
            saved_game = await self.db.query("SELECT game_id FROM saved_games WHERE game_id = $1 AND model_name = $2", [
                game.id,
                model_name
            ])
            if len(saved_game) == 0:
                saved_games.append(game)
        return saved_games


class GameSaverFactory(AbstractFactory):
    _values: dict[str, FactoryItem] = {
        "postgres": FactoryItem(name="postgres", factory_item=PostgresBasedGameSaver),
        "disk": FactoryItem(name="disk", factory_item=DiskBasedGameSaver),
    }
