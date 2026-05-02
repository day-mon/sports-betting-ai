from __future__ import annotations

from contextlib import asynccontextmanager
from typing import TYPE_CHECKING

from cashews import cache as global_cache

from accuribet_service.api.v1.games.service import GamesService
from accuribet_service.clients.actionnetwork import ActionNetworkClient
from accuribet_service.clients.nba import NBAClient
from accuribet_service.clients.rotowire import RotowireClient
from accuribet_service.config.cache import settings as cache_settings
from accuribet_service.core.dependencies import database
from typing_extensions import AsyncGenerator

if TYPE_CHECKING:
    import fastapi


@asynccontextmanager
async def lifecycle(app: fastapi.FastAPI) -> AsyncGenerator[None, None]:
    # Configure global cashews cache (used by @cache decorators)
    global_cache.setup(cache_settings.cache.connection_url)
    app.state.cache = global_cache

    app.state.db = database.create()

    # Create API clients
    nba_client = NBAClient()
    rotowire_client = RotowireClient()
    actionnetwork_client = ActionNetworkClient()

    # Create service with injected clients
    app.state.games_service = GamesService(
        nba_client=nba_client,
        rotowire_client=rotowire_client,
        actionnetwork_client=actionnetwork_client,
    )

    yield

    await app.state.cache.close()
    await app.state.db.dispose()
    await nba_client.close()
    await rotowire_client.close()
    await actionnetwork_client.close()
