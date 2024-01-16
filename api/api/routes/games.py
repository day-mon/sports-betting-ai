from typing import Optional

from loguru import logger
import httpx
from fastapi import APIRouter, Depends

from api.business.daily_games import DailyGameFactory, DailyGame
from api.business.injury import PlayerInjuryFactory
from api.business.odds import OddsFactory
from api.config.application import AppSettings, get_settings
from api.model.games.daily_game import Odds, DailyGameResponse
from api.model.games.injury import InjuryItem

router = APIRouter(prefix="/games", tags=["Games"])

client = httpx.AsyncClient()


@router.get(
    "/daily",
    summary="Gets the daily games w/ injuries & odds",
    description="Gets the daily games, if no_odds is set to true, then no odds will be returned",
    response_model=list[DailyGameResponse],
)
async def games(
    settings: AppSettings = Depends(get_settings),
    with_odds: Optional[bool] = True,
) -> list[DailyGameResponse]:
    game_fetcher = DailyGameFactory.compute_or_get(
        name=settings.DAILY_GAMES_SOURCE,
    )

    daily_games: list[DailyGame] = await game_fetcher.fetch()

    injury_fetcher = PlayerInjuryFactory.compute_or_get(
        name=settings.PLAYER_INJURY_SOURCE,
    )

    injuries: list[InjuryItem] = await injury_fetcher.fetch()

    odds_fetcher = OddsFactory.compute_or_get(
        name=settings.ODDS_SOURCE,
    )
    odds: Optional[dict[str, list[Odds]]] = (
        await odds_fetcher.fetch(daily_games) if with_odds else None
    )

    return DailyGameResponse.craft_response(
        games=daily_games, injuries=injuries, odds=odds
    )
