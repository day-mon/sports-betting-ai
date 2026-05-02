"""Create game_results table.

Revision ID: 001
Revises:
Create Date: 2026-05-01 00:00:00.000000

"""

from __future__ import annotations

import typing

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = "001"
down_revision: str | None = None
branch_labels: str | typing.Sequence[str] | None = None
depends_on: str | typing.Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "game_results",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), nullable=False),
        sa.Column("game_id", sa.String(), nullable=False),
        sa.Column("date", sa.Date(), nullable=False),
        sa.Column("home_team_name", sa.String(), nullable=False),
        sa.Column("home_team_score", sa.Integer(), nullable=False),
        sa.Column("away_team_name", sa.String(), nullable=False),
        sa.Column("away_team_score", sa.Integer(), nullable=False),
        sa.Column("winner", sa.String(), nullable=False),
        sa.Column("prediction", sa.String(), nullable=False),
        sa.Column("confidence", sa.Float(), nullable=True),
        sa.Column("model_name", sa.String(), nullable=False),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("game_id", "model_name", name="uq_game_results_game_model"),
        sa.Index("ix_game_results_date_model", "date", "model_name"),
        sa.Index("ix_game_results_game_id", "game_id"),
        sa.Index("ix_game_results_date", "date"),
        sa.Index("ix_game_results_model_name", "model_name"),
    )


def downgrade() -> None:
    op.drop_table("game_results")
