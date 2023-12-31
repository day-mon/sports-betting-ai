from typing import Any, Optional

from fastapi import APIRouter, Depends
import httpx
from httpx import Response
from starlette.exceptions import HTTPException
from loguru import logger
from api import constants
from api.business.daily_games import DailyGameFactory, DailyGame
from api.business.injury import PlayerInjuryFactory
from api.business.odds import OddsFactory
from api.config.application import AppSettings, get_settings
from api.model.games.daily_game import NBALiveData, Odds, DailyGameResponse
from api.model.games.injury import Injuries, InjuryItem

router = APIRouter(
    prefix="/games",
    tags=["games"]
)

client = httpx.AsyncClient()


@router.get("/daily")
async def games(
        settings: AppSettings = Depends(get_settings),
        no_odds: Optional[bool] = False,
) -> list[DailyGameResponse]:
    game_fetcher = DailyGameFactory.compute_or_get(
        name=settings.DAILY_GAMES_SOURCE,
    )

    games: list[DailyGame] = await game_fetcher.fetch()

    injury_fetcher = PlayerInjuryFactory.compute_or_get(
        name=settings.PLAYER_INJURY_SOURCE,
    )

    injuries: list[InjuryItem] = await injury_fetcher.fetch()

    odds_fetcher = OddsFactory.compute_or_get(
        name=settings.ODDS_SOURCE,
    )
    odds: Optional[dict[str, list[Odds]]] = (
        await odds_fetcher.fetch(games=games) if not no_odds else None
    )

    return DailyGameResponse.craft_response(
        games=games,
        injuries=injuries,
        odds=odds
    )
