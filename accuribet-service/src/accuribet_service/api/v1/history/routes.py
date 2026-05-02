from __future__ import annotations

import datetime
import typing

import fastapi
import sqlalchemy.ext.asyncio

from accuribet_service.api.v1.history import schemas, service, types
from accuribet_service.core.dependencies.database import get_session
from accuribet_service.core.dependencies.pagination import get_pagination, Pagination

router = fastapi.APIRouter()


def get_history_service(
    session: typing.Annotated[
        sqlalchemy.ext.asyncio.AsyncSession,
        fastapi.Depends(get_session),
    ],
) -> service.HistoryService:
    return service.HistoryService(session)


HistoryServiceDep = typing.Annotated[
    service.HistoryService,
    fastapi.Depends(get_history_service),
]


@router.get("/accuracy/{model_name}", response_model=schemas.AccuracyResponse)
async def get_model_accuracy(
    model_name: typing.Annotated[str, fastapi.Path()],
    svc: HistoryServiceDep,
) -> types.Accuracy:
    """Return accuracy stats for a specific prediction model."""
    return await svc.get_accuracy_for_model(model_name)


@router.get("/dates", response_model=list[schemas.DateListItem])
async def get_history_dates(
    svc: HistoryServiceDep,
) -> list[types.DateListItem]:
    """Return all distinct dates that have saved predictions per model."""
    return await svc.get_dates_for_all_models()


@router.get("/games", response_model=schemas.PaginatedGameHistory)
async def list_games(
    svc: HistoryServiceDep,
    pagination: typing.Annotated[Pagination, fastapi.Depends(get_pagination)],
    date: typing.Annotated[datetime.date | None, fastapi.Query()] = None,
    model_name: typing.Annotated[str | None, fastapi.Query()] = None,
) -> types.PaginatedGameHistory:
    """Return paginated game results with optional date and model filters."""
    return await svc.get_games_paginated(
        date,
        model_name,
        pagination.page,
        pagination.page_size,
    )


@router.get("/accuracy", response_model=list[schemas.AccuracyResponse])
async def get_date_accuracy(
    svc: HistoryServiceDep,
    date: typing.Annotated[datetime.date, fastapi.Query()],
) -> list[types.Accuracy]:
    """Return accuracy stats for all models on a given date."""
    return await svc.get_accuracy_for_date(date)
