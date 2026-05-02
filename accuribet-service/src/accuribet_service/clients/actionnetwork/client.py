"""ActionNetwork API client."""

from __future__ import annotations

import aiohttp
import structlog
from aiohttp_retry import ExponentialRetry, RetryClient

from accuribet_service.clients.actionnetwork import types

logger = structlog.get_logger(__name__)


class ActionNetworkClient:
    """Client for ActionNetwork odds API."""

    _BASE_URL: str = "https://api.actionnetwork.com"
    _BOOK_IDS: list[int] = [255, 280, 68, 246, 264, 74, 1906, 76]

    def __init__(self) -> None:
        self._session = RetryClient(
            base_url=self._BASE_URL,
            timeout=aiohttp.ClientTimeout(total=30),
            raise_for_status=True,
            retry_options=ExponentialRetry(attempts=3),
        )

    async def close(self) -> None:
        await self._session.close()

    @property
    def books(self) -> str:
        return ",".join(str(book) for book in self._BOOK_IDS)

    async def fetch_odds(self, date: str) -> types.ActionNetworkResponse | None:
        """Fetch odds from ActionNetwork."""

        headers = {
            "User-Agent": "Mozilla/5.0 (X11; Linux x86_64; rv:121.0) Gecko/20100101 Firefox/121.0"
        }

        async with self._session.get(
            url="/web/v1/scoreboard/nba",
            params={
                "period": "game",
                "bookIds": self.books,
                "date": date,
            },
            headers=headers,
        ) as resp:
            data = await resp.json()

        return types.ActionNetworkResponse.model_validate(data)
