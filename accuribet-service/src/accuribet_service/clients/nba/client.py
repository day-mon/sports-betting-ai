"""NBA API client."""

from __future__ import annotations

import aiohttp
import structlog
from aiohttp_retry import ExponentialRetry, RetryClient

from accuribet_service.clients.nba import types

logger = structlog.get_logger(__name__)


class NBAClient:
    """Client for NBA API."""

    _BASE_URL: str = "https://cdn.nba.com"

    def __init__(self) -> None:
        self._session = RetryClient(
            base_url=self._BASE_URL,
            timeout=aiohttp.ClientTimeout(total=30),
            retry_options=ExponentialRetry(attempts=3),
        )

    async def close(self) -> None:
        await self._session.close()

    async def fetch_games(self) -> types.NBAResponse:
        """Fetch daily games from NBA API."""
        logger.debug("fetching_nba_games")
        async with self._session.get(
            "/static/json/liveData/scoreboard/todaysScoreboard_00.json"
        ) as resp:
            data = await resp.text()
        return types.NBAResponse.model_validate_json(data)
