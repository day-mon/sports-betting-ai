import json
import os
from abc import ABC, abstractmethod

from pydantic import BaseModel

from api.business.factory import AbstractFactory, FactoryItem
from api.business.model import Prediction
from api.model.games.daily_game import DailyGame, DailyGameResponse


class SavedGame(BaseModel):
    daily_game: DailyGameResponse
    prediction: Prediction
    model_name: str


class GameSaver(ABC):
    @abstractmethod
    def save(self, games: list[SavedGame]) -> int:
        """
        Saves a game to a datastore

        :param game: DailyGame object
        :return: int representing the number of games saved
        """

    @abstractmethod
    def is_saved(self, games: list[DailyGameResponse]) -> list[DailyGameResponse]:
        """
        Checks if a game is already saved
        :param list[DailyGameResponse] game: DailyGame object
        :return list[DailyGameResponse]: Returns a list of games that are not saved
        """


class DiskBasedGameSaver(GameSaver):
    def save(self, games: list[SavedGame]) -> int:
        """
        Saves a game to a datastore

        :param game: DailyGame object
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


    def is_saved(self, games: list[DailyGameResponse]) -> list[DailyGameResponse]:
        """
        Checks if a game is already saved

        :param games: DailyGame object
        :return: bool representing if the game is saved
        """
        directory = '/tmp/nba-predictions'
        print(games)
        if not os.path.exists(directory):
            os.makedirs(directory)

        date = games[0].date.replace("-", "")
        if not os.path.exists(f"{directory}/{date}.json"):
            return games

        with open(f"{directory}/{date}.json", "r") as f:
            saved_games = f.read()
            saved_games = json.loads(saved_games)

        saved_games = [SavedGame.model_validate(game) for game in saved_games]
        saved_games = [game.daily_game for game in saved_games]
        saved_games = [DailyGameResponse.model_validate(game) for game in saved_games]
        saved_games = [game for game in saved_games if game not in games]
        return saved_games

class RedisBasedGameSaver(GameSaver):
    def save(self, game: list[SavedGame]) -> int:
        """
        Saves a game to a datastore

        :param game: DailyGame object
        :return: int representing the number of games saved
        """
        pass

    def is_saved(self, games: list[DailyGame]) -> list[DailyGame]:
        """
        Checks if a game is already saved

        :param games: DailyGame object
        :return: bool representing if the game is saved
        """
        pass


class GameSaverFactory(AbstractFactory):
    _values: dict[str, FactoryItem] = {
        "redis": FactoryItem(name="redis", factory_item=RedisBasedGameSaver),
        "disk": FactoryItem(name="disk", factory_item=DiskBasedGameSaver),
    }
