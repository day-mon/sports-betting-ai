# Dependency Injection

Use dependencies when:

- The logic can't be declared in Pydantic validation and requires additional logic
- The logic depends on external resources or could block in any other way
- Other dependencies need their results (it's a sub-dependency)
- The logic can be shared by multiple endpoints to do things like error early, authentication, etc.
- They need to handle cleanup (e.g., DB sessions, file handles), using dependencies with `yield`
- Their logic needs input data from the request, like headers, query parameters, etc.

## Annotated dependencies

Create a reusable type alias for shared dependencies.

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

Then inject it cleanly:

```python
@router.post("")
async def create_prediction(
    data: PredictionIn,
    session: Session,
) -> PredictionOut: ...
```

## Dependencies with `yield` and `scope`

When using dependencies with `yield`, they can have a `scope` that defines when the exit code is run.

Use the default scope `"request"` to run the exit code after the response is sent back.

```python
import typing
import fastapi


async def get_db():
    db = DBSession()
    try:
        yield db
    finally:
        db.close()


DBDep = typing.Annotated[DBSession, fastapi.Depends(get_db)]


@app.get("/items/")
async def read_items(db: DBDep):
    return db.query(Item).all()
```

Use the scope `"function"` when they should run the exit code after the response data is generated but before the response is sent back to the client.

```python
import typing
import fastapi


def get_username():
    try:
        yield "Rick"
    finally:
        print("Cleanup up before response is sent")


UserNameDep = typing.Annotated[str, fastapi.Depends(get_username, scope="function")]


@app.get("/users/me")
def get_user_me(username: UserNameDep):
    return username
```

## Class dependencies

Avoid creating class dependencies when possible.

If a class is needed, instead create a regular function dependency that returns a class instance.

Do this:

```python
import dataclasses
import typing
import fastapi


@dataclasses.dataclass
class DatabasePaginator:
    offset: int = 0
    limit: int = 100
    q: str | None = None

    def get_page(self) -> dict:
        return {
            "offset": self.offset,
            "limit": self.limit,
            "q": self.q,
            "items": [],
        }


def get_db_paginator(
    offset: int = 0, limit: int = 100, q: str | None = None
) -> DatabasePaginator:
    return DatabasePaginator(offset=offset, limit=limit, q=q)


PaginatorDep = typing.Annotated[DatabasePaginator, fastapi.Depends(get_db_paginator)]


@app.get("/items/")
async def read_items(paginator: PaginatorDep):
    return paginator.get_page()
```

instead of this:

```python
# DO NOT DO THIS
import typing
import fastapi


class DatabasePaginator:
    def __init__(self, offset: int = 0, limit: int = 100, q: str | None = None):
        self.offset = offset
        self.limit = limit
        self.q = q

    def get_page(self) -> dict:
        return {
            "offset": self.offset,
            "limit": self.limit,
            "q": self.q,
            "items": [],
        }


@app.get("/items/")
async def read_items(
    paginator: typing.Annotated[DatabasePaginator, fastapi.Depends()],
):
    return paginator.get_page()
```
