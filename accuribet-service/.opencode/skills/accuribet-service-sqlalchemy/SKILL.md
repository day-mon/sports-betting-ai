---
name: accuribet-service-sqlalchemy
description: Async SQLAlchemy 2.0 patterns for accuribet-service with mixins, aiosqlite, and asyncpg
license: MIT
compatibility: opencode
metadata:
  audience: backend-devs
  orm: sqlalchemy
---

## What I do

- Scaffold new models using the existing `DeclarativeBase` + mixin stack
- Set up async engines, session factories, and dependency-injected sessions
- Guide database config changes (sqlite vs postgres)

## When to use me

Use this when adding models, migrations, queries, or changing DB config in `accuribet-service`.

## Patterns

### Base model

```python
import sqlalchemy.orm

class Base(sqlalchemy.orm.DeclarativeBase):
    ...
```

### Model with mixins

```python
import typing
import sqlalchemy
import sqlalchemy.orm
from accuribet_service.models import Base, mixins

class Prediction(
    Base, mixins.IDMixin, mixins.LastUpdatedTimestampMixin, mixins.CRUDMixin
):
    type: sqlalchemy.orm.Mapped[typing.Literal["win-loss"]] = (
        sqlalchemy.orm.mapped_column()
    )
    game_id: sqlalchemy.orm.Mapped[int] = sqlalchemy.orm.mapped_column(
        sqlalchemy.Integer(),
    )
```

### Async engine + session factory

```python
import sqlalchemy.ext.asyncio
from accuribet_service.config import database as database_config

engine = sqlalchemy.ext.asyncio.create_async_engine(
    database_config.settings.db.connection_url,
    echo=database_config.settings.echo,
)
session_factory = sqlalchemy.ext.asyncio.async_sessionmaker(
    engine,
    expire_on_commit=database_config.settings.expire_on_commit,
)
```

### FastAPI session dependency

```python
import typing
import fastapi
import sqlalchemy.ext.asyncio

async def get_session(
    request: fastapi.Request,
) -> typing.AsyncGenerator[sqlalchemy.ext.asyncio.AsyncSession, None]:
    async with request.app.state.db.session_factory() as session:
        yield session


Session = typing.Annotated[
    sqlalchemy.ext.asyncio.AsyncSession,
    fastapi.Depends(get_session),
]
```

### CRUD mixin usage

All models using `mixins.CRUDMixin` get async classmethods:

```python
prediction = await Prediction.create(session, type="win-loss", game_id=1)
found = await Prediction.get(session, pk=1)
results = await Prediction.filter(session, filters={"type": "win-loss"})
```

## Rules

- Always use `sqlalchemy.orm.Mapped[...]` and `sqlalchemy.orm.mapped_column()`
- Always use `sqlalchemy.ext.asyncio` (AsyncEngine, AsyncSession, async_sessionmaker)
- Never use synchronous SQLAlchemy in async contexts
- Store engine/session_factory on `app.state.db` during lifespan
- Use `typing.Literal` for enum-like string columns when the set is closed
- Prefer the CRUD mixin over hand-rolled queries for standard operations
