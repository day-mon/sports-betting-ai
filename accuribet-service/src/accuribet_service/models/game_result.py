from __future__ import annotations

import typing

import sqlalchemy
import sqlalchemy.orm
from sqlalchemy import func
from sqlalchemy.ext.hybrid import hybrid_property

from accuribet_service.models import Base, mixins

if typing.TYPE_CHECKING:
    import datetime
    from accuribet_service.models.ml_model import MLModel


class GameResult(
    Base, mixins.IDMixin, mixins.LastUpdatedTimestampMixin, mixins.CRUDMixin
):
    """Stores the outcome of a predicted game for historical accuracy tracking.

    Each row represents one game + model combination. The unique constraint
    on (game_id, model_id) prevents duplicate entries.

    Attributes:
        game_id: External game identifier (e.g. NBA game ID).
        date: Date the game was played.
        home_team_name: Name of the home team.
        home_team_score: Final score of the home team.
        away_team_name: Name of the away team.
        away_team_score: Final score of the away team.
        winner: Name of the winning team.
        prediction: The model's prediction (team name for win-loss, total for ou).
        confidence: Model confidence score (optional).
        model_id: Foreign key to the MLModel that made the prediction.
        model: Relationship to the MLModel instance.
    """

    __tablename__ = "game_results"

    __table_args__ = (
        sqlalchemy.Index("ix_game_results_date_model", "date", "model_id"),
        sqlalchemy.UniqueConstraint(
            "game_id", "model_id", name="uq_game_results_game_model"
        ),
    )

    game_id: sqlalchemy.orm.Mapped[str] = sqlalchemy.orm.mapped_column(index=True)
    date: sqlalchemy.orm.Mapped[datetime.date] = sqlalchemy.orm.mapped_column(
        index=True
    )
    home_team_name: sqlalchemy.orm.Mapped[str] = sqlalchemy.orm.mapped_column()
    home_team_score: sqlalchemy.orm.Mapped[int] = sqlalchemy.orm.mapped_column()
    away_team_name: sqlalchemy.orm.Mapped[str] = sqlalchemy.orm.mapped_column()
    away_team_score: sqlalchemy.orm.Mapped[int] = sqlalchemy.orm.mapped_column()
    winner: sqlalchemy.orm.Mapped[str] = sqlalchemy.orm.mapped_column()
    prediction: sqlalchemy.orm.Mapped[str] = sqlalchemy.orm.mapped_column()
    confidence: sqlalchemy.orm.Mapped[float | None] = sqlalchemy.orm.mapped_column(
        nullable=True
    )
    model_id: sqlalchemy.orm.Mapped[int] = sqlalchemy.orm.mapped_column(
        sqlalchemy.ForeignKey("ml_models.id"),
        index=True,
    )
    model: sqlalchemy.orm.Mapped["MLModel"] = sqlalchemy.orm.relationship(
        back_populates="game_results",
        lazy="selectin",
    )

    @property
    def model_name(self) -> str:
        """Return the model name from the related MLModel."""
        return self.model.name if self.model else ""

    @hybrid_property
    def total_score(self) -> int:
        """Return the combined score of both teams."""
        return self.home_team_score + self.away_team_score

    @total_score.inplace.expression
    @classmethod
    def _total_score_expr(cls) -> sqlalchemy.ColumnElement[int]:
        """SQL expression for total score calculation."""
        return cls.home_team_score + cls.away_team_score

    @hybrid_property
    def prediction_error(self) -> float | None:
        """Return the absolute error for over-under predictions.

        Returns None for win-loss models or if model is not loaded.
        """
        if not self.model or not self.model.is_over_under:
            return None
        try:
            predicted_total = float(self.prediction)
            return abs(self.total_score - predicted_total)
        except ValueError:
            return None

    @prediction_error.inplace.expression
    @classmethod
    def _prediction_error_expr(cls) -> sqlalchemy.ColumnElement[float | None]:
        """SQL expression for prediction error (requires join to MLModel).

        Use with .join(MLModel) and filter for over-under models.
        """
        return func.abs(
            cls.home_team_score
            + cls.away_team_score
            - sqlalchemy.cast(cls.prediction, sqlalchemy.Float)
        )

    @hybrid_property
    def is_prediction_correct(self) -> bool | None:
        """Return whether the prediction was correct.

        For win-loss: True if predicted winner matches actual winner.
        For over-under: None (correctness is not boolean).
        """
        if not self.model:
            return None
        if self.model.is_win_loss:
            return self.winner == self.prediction
        return None  # over-under doesn't have boolean correctness

    @is_prediction_correct.inplace.expression
    @classmethod
    def _is_prediction_correct_expr(cls) -> sqlalchemy.ColumnElement[bool | None]:
        """SQL expression for prediction correctness (requires join to MLModel).

        Use with .join(MLModel) and filter for win-loss models.
        """
        return sqlalchemy.case(
            (cls.winner == cls.prediction, True),
            else_=None,
        )
