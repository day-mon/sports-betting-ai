from __future__ import annotations

import dataclasses
import typing

import fastapi


@dataclasses.dataclass(slots=True)
class Pagination:
    """Pagination parameters for list endpoints."""

    page: int = 1
    page_size: int = 20

    @property
    def offset(self) -> int:
        return (self.page - 1) * self.page_size


def get_pagination(
    page: typing.Annotated[int, fastapi.Query(ge=1)] = 1,
    page_size: typing.Annotated[int, fastapi.Query(ge=1, le=100)] = 20,
) -> Pagination:
    return Pagination(page=page, page_size=page_size)


PaginationDep = typing.Annotated[Pagination, fastapi.Depends(get_pagination)]
