import dataclasses
import typing

import fastapi
import sqlalchemy.ext.asyncio
from accuribet_service.config import database as database_config


@dataclasses.dataclass(slots=True)
class Database:
    engine: sqlalchemy.ext.asyncio.AsyncEngine
    session_factory: sqlalchemy.ext.asyncio.async_sessionmaker[
        sqlalchemy.ext.asyncio.AsyncSession
    ]

    async def dispose(self) -> None:
        await self.engine.dispose()


def create() -> Database:
    engine = sqlalchemy.ext.asyncio.create_async_engine(
        database_config.settings.db.connection_url,
        echo=database_config.settings.echo,
    )
    session_factory = sqlalchemy.ext.asyncio.async_sessionmaker(
        engine,
        expire_on_commit=database_config.settings.expire_on_commit,
    )

    return Database(engine=engine, session_factory=session_factory)


async def get_session(
    request: fastapi.Request,
) -> typing.AsyncGenerator[sqlalchemy.ext.asyncio.AsyncSession, None]:
    async with request.app.state.db.session_factory() as session:
        yield session


Session = typing.Annotated[
    sqlalchemy.ext.asyncio.AsyncSession,
    fastapi.Depends(get_session),
]
