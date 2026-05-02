"""Games service with injected API clients."""

from __future__ import annotations

import asyncio
import dataclasses

import structlog
from cashews import cache

from accuribet_service.api.v1.games import schemas, types
from accuribet_service.clients.actionnetwork import ActionNetworkClient
from accuribet_service.clients.nba import NBAClient
from accuribet_service.clients.rotowire import RotowireClient
from accuribet_service.config.app import settings

logger = structlog.get_logger(__name__)


class GamesService:
    """Service for games endpoints with injected API clients."""

    def __init__(
        self,
        nba_client: NBAClient,
        rotowire_client: RotowireClient,
        actionnetwork_client: ActionNetworkClient,
    ) -> None:
        self.nba_client = nba_client
        self.rotowire_client = rotowire_client
        self.actionnetwork_client = actionnetwork_client

    @cache(ttl=settings.games_cache_ttl, key="games:nba:daily")
    async def _fetch_nba_games(self) -> list[types.RawGameData]:
        """Fetch daily games from NBA API with caching."""
        logger.debug("fetching_nba_games")

        if not (games_data := (await self.nba_client.fetch_games()).scoreboard.games):
            return []

        games = [types.RawGameData.from_nba(game) for game in games_data]

        logger.info("nba_games_fetched", count=len(games))
        return games

    async def _fetch_injuries(self) -> list[types.InjuryItem]:
        logger.debug("fetching_injuries")

        injuries_data = await self.rotowire_client.fetch_injuries()
        injuries = [types.InjuryItem.from_rotowire(item) for item in injuries_data]

        logger.info("injuries_fetched", count=len(injuries))
        return injuries

    async def _fetch_odds(self, date: str) -> dict[str, list[types.Odds]] | None:
        logger.debug("fetching_odds", date=date)

        odds_data = await self.actionnetwork_client.fetch_odds(date)
        if not odds_data or not odds_data.games:
            return None

        odds_by_team: dict[str, list[types.Odds]] = {}

        for game in odds_data.games:
            if len(game.teams) != 2:
                continue

            if not (home_abbr := game.teams[0].abbr):
                continue

            odds_by_team[home_abbr] = []

            for odd in game.odds:
                if odds_item := types.Odds.from_actionnetwork(odd):
                    odds_by_team[home_abbr].append(odds_item)

        logger.info("odds_fetched", team_count=len(odds_by_team))
        return odds_by_team if odds_by_team else None

    def _craft_response(
        self,
        games: list[types.RawGameData],
        injuries: list[types.InjuryItem],
        odds: dict[str, list[types.Odds]] | None,
    ) -> list[types.DailyGameResponse]:
        """Transform raw data into API response format."""
        responses: list[types.DailyGameResponse] = []

        for game in games:
            home_abbr = game.home_team.abbreviation
            away_abbr = game.away_team.abbreviation

            game_odds = odds.get(home_abbr) if odds else None
            if not game_odds and odds:
                game_odds = odds.get(away_abbr)

            home_injuries = [i for i in injuries if i.team == home_abbr]
            away_injuries = [i for i in injuries if i.team == away_abbr]

            responses.append(
                types.DailyGameResponse(
                    id=game.game_id,
                    date=game.game_date,
                    status=game.game_status,
                    start_time_unix=game.game_start_unix,
                    location=types.Location.from_abbreviation(home_abbr),
                    home_team=types.TeamDataWithInjuries.from_team_data(
                        game.home_team, home_injuries
                    ),
                    away_team=types.TeamDataWithInjuries.from_team_data(
                        game.away_team, away_injuries
                    ),
                    odds=game_odds,
                )
            )

        return responses

    async def get_daily_games(
        self,
        with_odds: bool = True,
    ) -> list[schemas.DailyGameResponse]:
        """Get daily games with injuries and optional odds.

        Args:
            with_odds: Whether to include betting odds in response

        Returns:
            List of daily games with full team, injury, and odds data
        """
        games_task = self._fetch_nba_games()
        injuries_task = self._fetch_injuries()

        games, injuries = await asyncio.gather(games_task, injuries_task)

        if not games:
            logger.warning("no_games_found")
            return []

        odds = (
            await self._fetch_odds(games[0].game_date.replace("-", ""))
            if with_odds and games
            else None
        )

        response_data = self._craft_response(games, injuries, odds)

        return [
            schemas.DailyGameResponse.model_validate(dataclasses.asdict(item))
            for item in response_data
        ]
