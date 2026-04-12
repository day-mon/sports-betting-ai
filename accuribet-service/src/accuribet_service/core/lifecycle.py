from __future__ import annotations

from contextlib import asynccontextmanager
from typing import TYPE_CHECKING

from accuribet_service.core.dependencies import cache, database

if TYPE_CHECKING:
    import fastapi


@asynccontextmanager
async def lifecycle(app: fastapi.FastAPI) -> None:
    app.state.cache = cache.create()
    app.state.db = database.create()

    yield

    await app.state.cache.close()
    await app.state.db.dispose()
