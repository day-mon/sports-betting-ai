"""ML Model registry for tracking deployed prediction models."""

from __future__ import annotations

import typing

import sqlalchemy
import sqlalchemy.orm
from sqlalchemy.ext.hybrid import hybrid_property

from accuribet_service.models import Base, mixins

if typing.TYPE_CHECKING:
    from accuribet_service.models.game_result import GameResult


class MLModel(Base, mixins.IDMixin, mixins.LastUpdatedTimestampMixin, mixins.CRUDMixin):
    """Registry of ML models with metadata.

    Attributes:
        name: Unique model identifier (e.g., "nba_win_loss_v1").
        type: Model prediction type - "win-loss" or "over-under".
        path: Absolute or relative path to model file on disk.
        version: Semantic version or custom version string.
        is_active: Whether this model is currently active for predictions.
        description: Optional human-readable description.
        game_results: Relationship to all GameResult records for this model.
    """

    __tablename__ = "ml_models"

    name: sqlalchemy.orm.Mapped[str] = sqlalchemy.orm.mapped_column(
        sqlalchemy.String(255),
        unique=True,
        index=True,
        nullable=False,
    )
    type: sqlalchemy.orm.Mapped[typing.Literal["win-loss", "over-under"]] = (
        sqlalchemy.orm.mapped_column(nullable=False)
    )
    path: sqlalchemy.orm.Mapped[str] = sqlalchemy.orm.mapped_column(
        sqlalchemy.String(512),
        nullable=False,
    )
    version: sqlalchemy.orm.Mapped[str] = sqlalchemy.orm.mapped_column(
        sqlalchemy.String(50),
        nullable=False,
        default="1.0.0",
    )
    is_active: sqlalchemy.orm.Mapped[bool] = sqlalchemy.orm.mapped_column(
        default=True,
        nullable=False,
    )
    description: sqlalchemy.orm.Mapped[str | None] = sqlalchemy.orm.mapped_column(
        sqlalchemy.Text(),
        nullable=True,
    )
    game_results: sqlalchemy.orm.Mapped[list["GameResult"]] = (
        sqlalchemy.orm.relationship(
            back_populates="model",
            cascade="all, delete-orphan",
            lazy="selectin",
        )
    )

    @classmethod
    def win_loss_accuracy_query(cls, model_id: int) -> sqlalchemy.Select:
        """Return a SELECT for win-loss accuracy stats for a given model id."""
        from accuribet_service.models.game_result import GameResult

        correct = sqlalchemy.func.sum(
            sqlalchemy.case((GameResult.winner == GameResult.prediction, 1), else_=0)
        )
        total = sqlalchemy.func.count(GameResult.id)
        return sqlalchemy.select(
            (correct * 100.0 / total).label("win_rate"),
            total.label("total_games"),
            correct.label("total_correct"),
        ).where(GameResult.model_id == model_id)

    @classmethod
    def over_under_accuracy_query(cls, model_id: int) -> sqlalchemy.Select:
        """Return a SELECT for over-under accuracy stats for a given model id."""
        from accuribet_service.models.game_result import GameResult

        return sqlalchemy.select(
            sqlalchemy.func.avg(GameResult.prediction_error).label("avg_error"),
            sqlalchemy.func.count(GameResult.id).label("total_games"),
        ).where(GameResult.model_id == model_id)

    @hybrid_property
    def is_over_under(self) -> bool:
        """Return True if this is an over-under model."""
        return self.type == "over-under"

    @is_over_under.inplace.expression
    @classmethod
    def _is_over_under_expr(cls) -> sqlalchemy.ColumnElement[bool]:
        """SQL expression for over-under check."""
        return cls.type == "over-under"

    @hybrid_property
    def is_win_loss(self) -> bool:
        """Return True if this is a win-loss model."""
        return self.type == "win-loss"

    @is_win_loss.inplace.expression
    @classmethod
    def _is_win_loss_expr(cls) -> sqlalchemy.ColumnElement[bool]:
        """SQL expression for win-loss check."""
        return cls.type == "win-loss"

    def __repr__(self) -> str:
        return (
            f"<MLModel(id={self.id}, name='{self.name}', "
            f"type='{self.type}', version='{self.version}')>"
        )
