from abc import ABC, abstractmethod
import httpx
from api.business.factory import AbstractFactory, FactoryItem
from api.model.games.daily_game import NBALiveData, DailyGame, TeamData, PlayerLeader


class DailyGamesSource(ABC):
    source_url: str
    client: httpx.AsyncClient

    def __init__(self, source_url: str):
        self.source_url = source_url
        self.client = httpx.AsyncClient()

    @abstractmethod
    async def fetch(self) -> list[DailyGame]:
        pass


class NBAGAmesSource(DailyGamesSource):
    def __init__(self):
        super().__init__(
            "https://cdn.nba.com/static/json/liveData/scoreboard/todaysScoreboard_00.json"
        )

    async def fetch(self) -> list[DailyGame]:
        nba_daily_stats_response = await self.client.get(self.source_url)
        nba_daily_stats_response.raise_for_status()

        game_data: NBALiveData = NBALiveData.model_validate(
            nba_daily_stats_response.json()
        )
        daily_games: list[DailyGame] = []

        games = game_data.scoreboard.games

        if len(games) == 0:
            return daily_games

        for game in games:
            daily_games.append(
                DailyGame(
                    game_id=game.gameId,
                    game_date=game_data.scoreboard.gameDate,
                    game_status=game.gameStatusText,
                    home_team=TeamData(
                        id=game.homeTeam.teamId,
                        name=f"{game.homeTeam.teamCity} {game.homeTeam.teamName}",
                        score=game.homeTeam.score,
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
                        name=f"{game.awayTeam.teamCity} {game.awayTeam.teamName}",
                        score=game.awayTeam.score,
                        wins=game.awayTeam.wins,
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
