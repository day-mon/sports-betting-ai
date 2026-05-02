---
name: accuribet-service-fastapi
description: FastAPI patterns for accuribet-service. Annotated parameters, router-level config, return types for serialization, and async/sync path operation rules.
license: MIT
compatibility: opencode
metadata:
  audience: backend-devs
  framework: fastapi
---

## What I do

- Scaffold new API modules following the existing `api/v1/<domain>/` structure
- Enforce `Annotated` for parameters, dependencies, and query/path/header declarations
- Set router-level `prefix` and `tags`, apply shared dependencies at the router level
- Use return types / `response_model` to filter and serialize responses
- Keep one HTTP operation per function, and choose `async def` vs `def` correctly
- Reference detailed dependency injection patterns in `references/dependencies.md`

## When to use me

Use this when adding new endpoints, routers, or FastAPI modules to `accuribet-service`.

## Patterns

### Module layout

Each domain lives under `accuribet_service/api/v1/<domain>/`:

```
routes.py     - APIRouter and endpoint functions (HTTP layer / controller)
schemas.py    - pydantic request/response models
service.py    - business logic orchestration (service layer)
__init__.py   - exports `router`
```

### Router definition — prefix and tags at the router

```python
import fastapi

router = fastapi.APIRouter(
    prefix="/predictions",
    tags=["predictions"],
    dependencies=[fastapi.Depends(some_shared_dep)],
)
```

**Do NOT** pass `prefix` or `tags` to `app.include_router(router, prefix=..., tags=...)`.

### One HTTP operation per function

```python
@router.get("")
async def list_predictions() -> list[PredictionOut]: ...


@router.post("")
async def create_prediction(data: PredictionIn) -> PredictionOut: ...
```

Never use `@router.api_route("/", methods=["GET", "POST"])` with manual `request.method` branching.

### Annotated parameters

Always use `typing.Annotated` for path, query, header, and body parameters.

```python
import typing
import fastapi


@router.get("/{prediction_id}")
async def get_prediction(
    prediction_id: typing.Annotated[int, fastapi.Path(ge=1)],
    include_history: typing.Annotated[bool, fastapi.Query()] = False,
) -> PredictionOut: ...
```

**Do NOT** do `prediction_id: int = fastapi.Path(ge=1)`.

### Annotated dependencies

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

See [references/dependencies.md](references/dependencies.md) for detailed dependency injection patterns including `yield`, `scope`, and class dependencies.

### Return types and response models

Always declare a return type. It validates, filters, and serializes the response via Pydantic (Rust side), which is the main performance win.

```python
@router.get("/me")
async def get_current() -> UserOut:
    return UserOut.from_orm(internal_user)
```

If the return type differs from what you want to serialize, use `response_model` on the decorator:

```python
@router.get("/me", response_model=UserOut)
async def get_current() -> typing.Any:
    return internal_user
```

This is the primary way to avoid leaking sensitive fields.

### Do not use `...` for required parameters

```python
# Good
class ItemIn(pydantic.BaseModel):
    name: str
    price: float = pydantic.Field(gt=0)

# Bad
class ItemIn(pydantic.BaseModel):
    name: str = ...
    price: float = pydantic.Field(..., gt=0)
```

Same for path operation parameters — `Annotated[int, fastapi.Path()]` is enough, no `...` needed.

### Async vs sync path operations

Use `async def` only when the code inside is truly async/await compatible.

```python
# Good — calls async library
@app.get("/async-items/")
async def read_async_items():
    data = await some_async_library.fetch_items()
    return data

# Good — calls blocking library, runs in threadpool
@app.get("/items/")
def read_items():
    data = some_blocking_library.fetch_items()
    return data
```

**Default to `def` when in doubt.** Blocking code inside `async def` will damage performance.

The same rule applies to dependencies.

### Do not use ORJSONResponse or UJSONResponse

They are deprecated. Rely on return types / `response_model` for fast serialization.

### Do not use Pydantic RootModel

Use regular type annotations with `Annotated` and Pydantic validation utilities instead.

```python
# Good
@app.post("/items/")
async def create_items(
    items: typing.Annotated[list[int], pydantic.Field(min_length=1), fastapi.Body()],
):
    return items

# Bad — RootModel
class ItemList(pydantic.RootModel[...]):
    pass
```

### v1 router aggregation

`api/v1/__init__.py` creates the versioned router:

```python
from fastapi import APIRouter
from accuribet_service.api.v1 import health, predictions

router = APIRouter(prefix="/v1")
router.include_router(health.router)
router.include_router(predictions.router)

__all__ = ["router"]
```

## Rules

- Use `fastapi.APIRouter` with explicit `prefix` and `tags`
- Use `typing.Annotated[..., fastapi.Depends(...)]` for injectables; create type aliases
- Use `typing.Annotated[..., fastapi.Path() / Query() / Header() / Body()]` for parameters
- Always declare a return type; use `response_model` only when the return type differs from the serialized shape
- One HTTP operation per function — no `api_route` with method branching
- Do not use `...` as a default for required fields or parameters
- Prefer `def` over `async def` when calling blocking code or when uncertain
- Do not use `ORJSONResponse`, `UJSONResponse`, or `RootModel`
- Keep route functions thin; delegate to services or CRUD mixins
- Do NOT use relative imports in `api/**/__init__.py`

## References

- [references/dependencies.md](references/dependencies.md) — detailed dependency injection patterns: `yield`, `scope`, class dependencies, when to use dependencies
