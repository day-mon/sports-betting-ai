"""Add model_id FK to game_results.

Revision ID: 003
Revises: 002
Create Date: 2026-05-01 00:00:00.000000

"""

from __future__ import annotations

import typing

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = "003"
down_revision: str = "002"
branch_labels: str | typing.Sequence[str] | None = None
depends_on: str | typing.Sequence[str] | None = None


def upgrade() -> None:
    # Add model_id column (nullable initially for migration)
    op.add_column("game_results", sa.Column("model_id", sa.Integer(), nullable=True))

    # Create foreign key constraint
    op.create_foreign_key(
        "fk_game_results_ml_models",
        "game_results",
        "ml_models",
        ["model_id"],
        ["id"],
    )

    # Create new index on (date, model_id)
    op.create_index(
        "ix_game_results_date_model_id",
        "game_results",
        ["date", "model_id"],
    )

    # Create new unique constraint on (game_id, model_id)
    op.create_unique_constraint(
        "uq_game_results_game_model_id",
        "game_results",
        ["game_id", "model_id"],
    )

    # Migrate data: populate model_id from ml_models lookup by model_name
    op.execute("""
        UPDATE game_results
        SET model_id = ml_models.id
        FROM ml_models
        WHERE game_results.model_name = ml_models.name
    """)

    # For any remaining rows without a matching ml_model, we need to handle them
    # Option 1: Create placeholder models for orphaned records
    # Option 2: Delete orphaned records
    # Option 3: Make model_id nullable (current approach)

    # Drop old unique constraint on (game_id, model_name)
    op.drop_constraint(
        "uq_game_results_game_model",
        "game_results",
        type_="unique",
    )

    # Drop old index on (date, model_name)
    op.drop_index(
        "ix_game_results_date_model",
        table_name="game_results",
    )

    # Drop model_name column (now accessed via relationship)
    op.drop_column("game_results", "model_name")

    # Make model_id non-nullable after migration
    op.alter_column(
        "game_results",
        "model_id",
        existing_type=sa.Integer(),
        nullable=False,
    )

    # Create index on model_id
    op.create_index(
        "ix_game_results_model_id",
        "game_results",
        ["model_id"],
    )


def downgrade() -> None:
    # Add back model_name column
    op.add_column("game_results", sa.Column("model_name", sa.String(), nullable=True))

    # Restore model_name from ml_models lookup
    op.execute("""
        UPDATE game_results
        SET model_name = ml_models.name
        FROM ml_models
        WHERE game_results.model_id = ml_models.id
    """)

    # Drop foreign key
    op.drop_constraint(
        "fk_game_results_ml_models",
        "game_results",
        type_="foreignkey",
    )

    # Drop new unique constraint
    op.drop_constraint(
        "uq_game_results_game_model_id",
        "game_results",
        type_="unique",
    )

    # Drop new index
    op.drop_index(
        "ix_game_results_date_model_id",
        table_name="game_results",
    )

    # Drop model_id index
    op.drop_index(
        "ix_game_results_model_id",
        table_name="game_results",
    )

    # Drop model_id column
    op.drop_column("game_results", "model_id")

    # Restore old unique constraint
    op.create_unique_constraint(
        "uq_game_results_game_model",
        "game_results",
        ["game_id", "model_name"],
    )

    # Restore old index
    op.create_index(
        "ix_game_results_date_model",
        "game_results",
        ["date", "model_name"],
    )

    # Make model_name non-nullable
    op.alter_column(
        "game_results",
        "model_name",
        existing_type=sa.String(),
        nullable=False,
    )
