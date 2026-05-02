from __future__ import annotations

import typing

import fastapi
from accuribet_service.api.v1.history import controller, schemas, types

if typing.TYPE_CHECKING:
    from accuribet_service.core.dependencies.pagination import PaginationDep
    from accuribet_service.core.dependencies.database import Session
    import datetime

router = fastapi.APIRouter()


@router.get("/accuracy/{model_name}", response_model=schemas.AccuracyResponse)
async def get_model_accuracy(
    model_name: typing.Annotated[str, fastapi.Path()],
    session: Session,
) -> types.Accuracy:
    """Return accuracy stats for a specific prediction model."""
    return await controller.get_accuracy_for_model(session, model_name)


@router.get("/dates", response_model=list[schemas.DateListItem])
async def get_history_dates(
    session: Session,
) -> list[types.DateListItem]:
    """Return all distinct dates that have saved predictions per model."""
    return await controller.get_dates_for_all_models(session)


@router.get("/games", response_model=schemas.PaginatedGameHistory)
async def list_games(
    session: Session,
    pagination: PaginationDep,
    date: typing.Annotated[datetime.date | None, fastapi.Query()] = None,
    model_name: typing.Annotated[str | None, fastapi.Query()] = None,
) -> types.PaginatedGameHistory:
    """Return paginated game results with optional date and model filters."""
    return await controller.get_games_paginated(
        session,
        date,
        model_name,
        pagination.page,
        pagination.page_size,
    )


@router.get("/accuracy", response_model=list[schemas.AccuracyResponse])
async def get_date_accuracy(
    session: Session,
    date: typing.Annotated[datetime.date, fastapi.Query()],
) -> list[types.Accuracy]:
    """Return accuracy stats for all models on a given date."""
    return await controller.get_accuracy_for_date(session, date)
