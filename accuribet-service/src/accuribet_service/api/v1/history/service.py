"""History service with injected database session."""

from __future__ import annotations

import datetime

import sqlalchemy
import sqlalchemy.ext.asyncio
import sqlalchemy.sql.functions as func
from sqlalchemy.exc import NoResultFound

from accuribet_service.api.v1.history import types
from accuribet_service.models.game_result import GameResult
from accuribet_service.models.ml_model import MLModel


class HistoryService:
    """Service for history endpoints with injected database session."""

    def __init__(self, session: sqlalchemy.ext.asyncio.AsyncSession) -> None:
        self.session = session

    async def get_accuracy_for_model(self, model_name: str) -> types.Accuracy:
        """Return accuracy stats for a single model.

        Looks up model type from MLModel registry and queries GameResult via FK.
        """
        if not (model := await MLModel.filter_one(self.session, name=model_name)):
            raise NoResultFound(f"MLModel {model_name!r} not found")

        if model.type == "over-under":
            row = (await self.session.execute(MLModel.over_under_accuracy_query(model.id))).one()
            return types.OverUnderAccuracy(
                type="over-under",
                model_name=model_name,
                avg_error=float(row.avg_error) if row.avg_error else 0.0,
                total_games=row.total_games,
            )

        row = (await self.session.execute(MLModel.win_loss_accuracy_query(model.id))).one()
        return types.WinLossAccuracy(
            type="win-loss",
            model_name=model_name,
            win_rate=float(row.win_rate) if row.win_rate else 0.0,
            total_games=row.total_games,
            total_correct=row.total_correct,
        )

    async def get_dates_for_all_models(self) -> list[types.DateListItem]:
        """Return distinct dates per model, ordered newest first.

        Uses a single query with join instead of N+1 queries.
        """
        result = await self.session.execute(
            sqlalchemy.select(MLModel.name, GameResult.date)
            .distinct()
            .join(GameResult, MLModel.id == GameResult.model_id)
            .order_by(MLModel.name, GameResult.date.desc())
        )

        from collections import defaultdict

        model_dates: defaultdict[str, list[str]] = defaultdict(list)
        for model_name, date in result.all():
            model_dates[model_name].append(date.isoformat())

        return [
            types.DateListItem(model_name=name, dates=dates) for name, dates in model_dates.items()
        ]

    async def get_games_paginated(
        self,
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

        count_query = sqlalchemy.select(func.count(GameResult.id)).select_from(query.subquery())
        total_result = await self.session.execute(count_query)
        total = total_result.scalar_one()

        query = (
            query.order_by(GameResult.date.desc()).offset((page - 1) * page_size).limit(page_size)
        )
        result = await self.session.execute(query)
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

    async def get_accuracy_for_date(self, date: datetime.date) -> list[types.Accuracy]:
        """Return accuracy for all models on a given date.

        Uses a single grouped query instead of N+1 individual queries.
        """
        correct_expr = sqlalchemy.func.sum(
            sqlalchemy.case(
                (GameResult.winner == GameResult.prediction, 1),
                else_=0,
            )
        )
        total_expr = sqlalchemy.func.count(GameResult.id)
        error_expr = sqlalchemy.func.avg(
            sqlalchemy.func.abs(
                GameResult.home_team_score
                + GameResult.away_team_score
                - sqlalchemy.cast(GameResult.prediction, sqlalchemy.Float)
            )
        )

        result = await self.session.execute(
            sqlalchemy.select(
                MLModel.name,
                MLModel.type,
                (correct_expr * 100.0 / total_expr).label("win_rate"),
                total_expr.label("total_games"),
                correct_expr.label("total_correct"),
                error_expr.label("avg_error"),
            )
            .join(GameResult, MLModel.id == GameResult.model_id)
            .where(GameResult.date == date)
            .group_by(MLModel.id, MLModel.name, MLModel.type)
        )

        responses: list[types.Accuracy] = []
        for row in result.all():
            if row.type == "over-under":
                responses.append(
                    types.OverUnderAccuracy(
                        type="over-under",
                        model_name=row.name,
                        avg_error=float(row.avg_error) if row.avg_error else 0.0,
                        total_games=row.total_games,
                    )
                )
            else:
                responses.append(
                    types.WinLossAccuracy(
                        type="win-loss",
                        model_name=row.name,
                        win_rate=float(row.win_rate) if row.win_rate else 0.0,
                        total_games=row.total_games,
                        total_correct=row.total_correct,
                    )
                )

        return responses
