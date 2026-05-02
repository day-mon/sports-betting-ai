"""Rotowire API client."""

from __future__ import annotations

import aiohttp
import structlog
from aiohttp_retry import ExponentialRetry, RetryClient

from accuribet_service.clients.rotowire import types

logger = structlog.get_logger(__name__)


class RotowireClient:
    """Client for Rotowire injury API."""

    _BASE_URL: str = "https://www.rotowire.com"

    def __init__(self) -> None:
        self._session = RetryClient(
            base_url=self._BASE_URL,
            timeout=aiohttp.ClientTimeout(total=30),
            retry_options=ExponentialRetry(attempts=3),
        )

    async def close(self) -> None:
        await self._session.close()

    async def fetch_injuries(
        self,
        *,
        team: str = "ALL",
        pos: str = "ALL",
    ) -> list[types.InjuryItem]:
        """Fetch injury report from Rotowire.

        Args:
            team: Team code (e.g., "LAL", "MIA") or "ALL" for all teams.
            pos: Position ("G", "F", "C") or "ALL" for all positions.
        """
        logger.debug("fetching_injuries", team=team, pos=pos)
        async with self._session.get(
            "/basketball/tables/injury-report.php",
            params={"team": team, "pos": pos},
        ) as resp:
            data = await resp.json()
        return [types.InjuryItem.model_validate(item) for item in data]
