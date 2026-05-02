---
name: accuribet-service-style
description: Code style, linting, and typing conventions for the accuribet monorepo
license: MIT
compatibility: opencode
metadata:
  audience: all-devs
  tools: ruff, pyrefly, commitizen
---

## What I do

- Enforce ruff rules, pyrefly typing, and commit conventions
- Keep imports clean and TYPE_CHECKING blocks correct
- Prevent common style regressions

## When to use me

Use this before committing or when refactoring code in any accuribet package.

## Conventions

### Python version

Requires Python >=3.14. Use modern syntax freely.

### Imports

- Use `from __future__ import annotations` at the top of every file
- Use `typing.TYPE_CHECKING` blocks for imports only needed for type hints
- Use absolute imports everywhere except within the same package's deep modules
- Do NOT use relative imports in `api/**/__init__.py`

Example:

```python
from __future__ import annotations

from typing import TYPE_CHECKING

import fastapi

if TYPE_CHECKING:
    from sqlalchemy.ext.asyncio import AsyncSession
```

### Ruff rules enabled

`TC`, `A`, `AIR`, `B`, `RUF`, `COM`, `ANN`, `FIX`, `SLOT`, `PERF`, `F`, `E`, `W`, `PTH`

Key implications:
- `ANN`: annotate public functions
- `SLOT`: use `@dataclasses.dataclass(slots=True)`
- `COM812`: ignored — do NOT add trailing commas everywhere
- `RUF067`: ignored in `api/**/__init__.py` only

### Dataclasses

Always use `slots=True`:

```python
import dataclasses

@dataclasses.dataclass(slots=True)
class Database:
    engine: sqlalchemy.ext.asyncio.AsyncEngine
    session_factory: sqlalchemy.ext.asyncio.async_sessionmaker[...]
```

### Typing

- Prefer `typing.Annotated` over bare decorators
- Prefer `X | Y` over `typing.Union[X, Y]`
- Use `typing.Literal` for fixed string sets
- Use `Self` from `typing` for fluent returns

### Commits

Use conventional commits via commitizen (`cz_conventional_commits`).
Format: `type(scope): subject`

## Rules

- Run `ruff check --fix` and `pyrefly check` before committing
- Keep `__all__` explicit in public `__init__.py` files
- Do not add trailing commas (COM812 is ignored, but don't fight it)
- Use `...` for empty function bodies, not `pass`
