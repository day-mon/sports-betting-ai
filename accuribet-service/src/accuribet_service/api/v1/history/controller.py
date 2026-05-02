from __future__ import annotations

from typing import TYPE_CHECKING

import sqlalchemy
import sqlalchemy.ext.asyncio
import sqlalchemy.sql.functions as func
from sqlalchemy.exc import NoResultFound
from accuribet_service.api.v1.history import types
from accuribet_service.models.game_result import GameResult
from accuribet_service.models.ml_model import MLModel

if TYPE_CHECKING:
    import datetime


async def get_accuracy_for_model(
    session: sqlalchemy.ext.asyncio.AsyncSession,
    model_name: str,
) -> types.Accuracy:
    """Return accuracy stats for a single model.

    Looks up model type from MLModel registry and queries GameResult via FK.
    """
    if not (model := await MLModel.filter_one(session, name=model_name)):
        raise NoResultFound(f"MLModel {model_name!r} not found")

    if model.type == "over-under":
        row = (await session.execute(MLModel.over_under_accuracy_query(model.id))).one()
        return types.OverUnderAccuracy(
            type="over-under",
            model_name=model_name,
            avg_error=float(row.avg_error) if row.avg_error else 0.0,
            total_games=row.total_games,
        )

    row = (await session.execute(MLModel.win_loss_accuracy_query(model.id))).one()
    return types.WinLossAccuracy(
        type="win-loss",
        model_name=model_name,
        win_rate=float(row.win_rate) if row.win_rate else 0.0,
        total_games=row.total_games,
        total_correct=row.total_correct,
    )


async def get_dates_for_all_models(
    session: sqlalchemy.ext.asyncio.AsyncSession,
) -> list[types.DateListItem]:
    """Return distinct dates per model, ordered newest first."""
    model_result = await session.execute(sqlalchemy.select(MLModel.id, MLModel.name))
    models = {row[0]: row[1] for row in model_result.all()}

    items: list[types.DateListItem] = []
    for model_id, model_name in models.items():
        date_result = await session.execute(
            sqlalchemy
            .select(sqlalchemy.distinct(GameResult.date))
            .where(GameResult.model_id == model_id)
            .order_by(GameResult.date.desc())
        )
        dates = [row[0] for row in date_result.all()]
        items.append(
            types.DateListItem(
                model_name=model_name,
                dates=[d.isoformat() for d in dates],
            )
        )
    return items


async def get_games_paginated(
    session: sqlalchemy.ext.asyncio.AsyncSession,
    date: datetime.date | None,
    model_name: str | None,
    page: int,
    page_size: int,
) -> types.PaginatedGameHistory:
    """Return paginated game results with optional filters."""
    query = sqlalchemy.select(
        GameResult,
        MLModel.name.label("model_name"),
        MLModel.type.label("model_type"),
    ).join(MLModel, GameResult.model_id == MLModel.id)

    filters: list[sqlalchemy.ColumnElement[bool]] = []
    if date is not None:
        filters.append(GameResult.date == date)
    if model_name is not None:
        filters.append(MLModel.name == model_name)

    if filters:
        query = query.where(sqlalchemy.and_(*filters))

    count_query = sqlalchemy.select(func.count(GameResult.id)).select_from(
        query.subquery()
    )
    total_result = await session.execute(count_query)
    total = total_result.scalar_one()

    query = (
        query
        .order_by(GameResult.date.desc())
        .offset((page - 1) * page_size)
        .limit(page_size)
    )
    result = await session.execute(query)
    rows = result.all()

    items: list[types.GameHistoryItem] = []
    for row in rows:
        game = row[0]
        row_model_name = row.model_name

        items.append(
            types.GameHistoryItem(
                game_id=game.game_id,
                date=game.date.isoformat(),
                home_team_name=game.home_team_name,
                home_team_score=game.home_team_score,
                away_team_name=game.away_team_name,
                away_team_score=game.away_team_score,
                winner=game.winner,
                prediction=game.prediction,
                prediction_was_correct=game.is_prediction_correct,
                confidence=game.confidence,
                model_name=row_model_name,
            )
        )

    return types.PaginatedGameHistory(
        items=items,
        total=total,
        page=page,
        page_size=page_size,
    )


async def get_accuracy_for_date(
    session: sqlalchemy.ext.asyncio.AsyncSession,
    date: datetime.date,
) -> list[types.Accuracy]:
    """Return accuracy for all models on a given date."""
    model_result = await session.execute(
        sqlalchemy
        .select(sqlalchemy.distinct(MLModel.name))
        .join(GameResult, MLModel.id == GameResult.model_id)
        .where(GameResult.date == date)
    )
    model_names = [row[0] for row in model_result.all()]

    responses: list[types.Accuracy] = [
        await get_accuracy_for_model(session, model_name) for model_name in model_names
    ]

    return responses
