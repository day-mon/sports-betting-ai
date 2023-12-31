from abc import abstractmethod, ABC
from typing import Any, Optional

import httpx
from pydantic import BaseModel

from api.business.factory import AbstractFactory
from api.model.games.daily_game import Odds, DailyGame
from loguru import logger


class OddsSource(ABC):
    source_url: str
    client: httpx.AsyncClient = httpx.AsyncClient()

    def __init__(self, source_url: str):
        self.source_url = source_url

    @abstractmethod
    async def fetch(self, games: list[DailyGame]) -> Optional[dict[str, Odds]]:
        pass


class ActionNetworkOddsSource(OddsSource):
    odds_dict: dict[int, str] = {
        0: "Unknown",
        255: "Fanduel",
        280: "BetMGM",
        68: "DraftKings",
        246: "Unibet",
        264: "US",
        74: "BetPARX",
        1906: "Caesars",
        76: "Pointsbet",
    }
    book_ids_to_skip = [15, 30, 264, 110, 75]

    def __init__(self):
        super().__init__(
            "https://api.actionnetwork.com/web/v1/scoreboard/nba?period=game&bookIds=255,280,68,246,264,74,1906,76&date=")

    async def fetch(self, games: list[DailyGame]) -> Optional[dict[str, list[Odds]]]:
        date = games[0].game_date.replace("-", "")
        url = f"{self.source_url}{date}"
        response = await self.client.get(url, headers={
            "User-Agent": "Mozilla/5.0 (X11; Linux x86_64; rv:121.0) Gecko/20100101 Firefox/121.0"
        })
        response.raise_for_status()
        odds_response = response.json()
        games = odds_response.get("games", None)
        if not games or len(games) == 0:
            return None

        odds_return_value: dict[str, list[Odds]] = {}
        for game in games:
            teams = game.get("teams", None)
            if not teams:
                return None
            if len(teams) != 2:
                return None

            home_team = teams[0]
            away_team = teams[1]

            odds = game.get("odds", None)
            if not odds:
                continue

            odds_return_value.update(
                {
                    home_team.get("abbr"): [],
                }
            )

            for odd in odds:
                book_id = odd.get("book_id", None)
                if not book_id:
                    logger.warning(f"Unable to find book_id for game: {game}")
                    continue

                if book_id in self.book_ids_to_skip:
                    continue


                odds_return_value[home_team.get("abbr")].append(
                    Odds(
                        book_name=self.odds_dict.get(book_id, "Unknown"),
                        home_money_line=odd.get("ml_home", 0),
                        away_money_line=odd.get("ml_away", 0),
                        over_under=odd.get("total", 0),
                        num_bets=odd.get("num_bets", None),
                    )
                )
        return odds_return_value


class OddsFactory(AbstractFactory):
    _values = {
        "actionnetwork": ActionNetworkOddsSource,
    }
