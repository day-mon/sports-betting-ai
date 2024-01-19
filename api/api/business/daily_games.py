from abc import ABC, abstractmethod
from datetime import datetime

import httpx

from api import constants
from api.business.factory import AbstractFactory, FactoryItem
from api.model.games.daily_game import NBALiveData, DailyGame, TeamData, PlayerLeader, Score


class DailyGamesSource(ABC):
    source_url: str
    client: httpx.AsyncClient

    def __init__(self, source_url: str):
        self.source_url = source_url

    @abstractmethod
    async def fetch(self) -> list[DailyGame]:
        pass


class NBAGAmesSource(DailyGamesSource):
    def __init__(self):
        super().__init__(
            "https://cdn.nba.com/static/json/liveData/scoreboard/todaysScoreboard_00.json"
        )

    async def fetch(self) -> list[DailyGame]:
        async with httpx.AsyncClient(timeout=60) as client:
            nba_daily_stats_response = await client.get(self.source_url)

        nba_daily_stats_response.raise_for_status()
        game_data: NBALiveData = NBALiveData.model_validate(
            nba_daily_stats_response.json()
        )
        daily_games: list[DailyGame] = []

        games = game_data.scoreboard.games

        if len(games) == 0:
            return daily_games

        for game in games:
            datetime_obj = datetime.strptime(game.gameTimeUTC, "%Y-%m-%dT%H:%M:%SZ")
            unix_timestamp = datetime_obj.timestamp()

            daily_games.append(
                DailyGame(
                    game_id=game.gameId,
                    game_date=game_data.scoreboard.gameDate,
                    game_status=game.gameStatusText,
                    game_start_unix=unix_timestamp,
                    home_team=TeamData(
                        id=game.homeTeam.teamId,
                        score=Score(
                            points=game.homeTeam.score,
                            periods=game.homeTeam.periods
                        ),
                        city=game.homeTeam.teamCity,
                        seed=game.homeTeam.seed,
                        name=game.homeTeam.teamName,
                        wins=game.homeTeam.wins,
                        losses=game.homeTeam.losses,
                        abbreviation=game.homeTeam.teamTricode,
                        leader=None
                        if game.gameLeaders.home_is_empty()
                        else PlayerLeader(
                            name=game.gameLeaders.homeLeaders.name,
                            points=game.gameLeaders.homeLeaders.points,
                            rebounds=game.gameLeaders.homeLeaders.rebounds,
                            assists=game.gameLeaders.homeLeaders.assists,
                        ),
                    ),
                    away_team=TeamData(
                        id=game.awayTeam.teamId,
                        city=game.awayTeam.teamCity,
                        name=game.awayTeam.teamName,
                        score=Score(
                            points=game.awayTeam.score,
                            periods=game.awayTeam.periods
                        ),
                        wins=game.awayTeam.wins,
                        seed=game.awayTeam.seed,
                        losses=game.awayTeam.losses,
                        abbreviation=game.awayTeam.teamTricode,
                        leader=None
                        if game.gameLeaders.away_is_empty()
                        else PlayerLeader(
                            name=game.gameLeaders.awayLeaders.name,
                            points=game.gameLeaders.awayLeaders.points,
                            rebounds=game.gameLeaders.awayLeaders.rebounds,
                            assists=game.gameLeaders.awayLeaders.assists,
                        ),
                    ),
                )
            )

        return daily_games


class DailyGameFactory(AbstractFactory):
    _values: dict[str, FactoryItem] = {
        "nba": FactoryItem(
            name="nba",
            factory_item=NBAGAmesSource,
        ),
    }
