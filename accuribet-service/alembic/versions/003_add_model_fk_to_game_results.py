"""Add model_id FK to game_results.

Revision ID: 003
Revises: 002
Create Date: 2026-05-01 00:00:00.000000

"""

from __future__ import annotations

import typing

from alembic import op
import sqlalchemy as sa
from sqlalchemy import inspect

# revision identifiers, used by Alembic.
revision: str = "003"
down_revision: str = "002"
branch_labels: str | typing.Sequence[str] | None = None
depends_on: str | typing.Sequence[str] | None = None


def _column_exists(table_name: str, column_name: str) -> bool:
    """Check if a column exists in a table."""
    conn = op.get_bind()
    inspector = inspect(conn)
    columns = [col["name"] for col in inspector.get_columns(table_name)]
    return column_name in columns


def _index_exists(table_name: str, index_name: str) -> bool:
    """Check if an index exists on a table."""
    conn = op.get_bind()
    inspector = inspect(conn)
    indexes = [idx["name"] for idx in inspector.get_indexes(table_name)]
    return index_name in indexes


def _constraint_exists(table_name: str, constraint_name: str) -> bool:
    """Check if a constraint exists on a table."""
    conn = op.get_bind()
    inspector = inspect(conn)
    constraints = [cons["name"] for cons in inspector.get_unique_constraints(table_name)]
    # Also check foreign keys
    foreign_keys = [fk["name"] for fk in inspector.get_foreign_keys(table_name)]
    return constraint_name in constraints or constraint_name in foreign_keys


def upgrade() -> None:
    dialect = op.get_context().dialect.name

    if dialect == "sqlite":
        _upgrade_sqlite()
    else:
        _upgrade_postgresql()


def _upgrade_sqlite() -> None:
    """SQLite upgrade using table recreation for constraint changes."""
    # Check if model_id already exists (partial migration)
    model_id_exists = _column_exists("game_results", "model_id")

    if not model_id_exists:
        # Step 1: Add model_id column (nullable)
        op.add_column("game_results", sa.Column("model_id", sa.Integer(), nullable=True))

    # Step 2: Populate model_id from ml_models lookup
    # SQLite doesn't support UPDATE...FROM, use correlated subquery
    op.execute("""
        UPDATE game_results
        SET model_id = (
            SELECT ml_models.id
            FROM ml_models
            WHERE ml_models.name = game_results.model_name
        )
        WHERE model_id IS NULL
    """)

    # Step 3: Recreate table with new schema (SQLite requires this for constraint changes)
    # Create new table WITHOUT indexes first (to avoid name conflicts with old table)
    op.create_table(
        "game_results_new",
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
        sa.Column("model_id", sa.Integer(), nullable=False),
        sa.PrimaryKeyConstraint("id"),
        sa.ForeignKeyConstraint(["model_id"], ["ml_models.id"], name="fk_game_results_ml_models"),
        sa.UniqueConstraint("game_id", "model_id", name="uq_game_results_game_model_id"),
    )

    # Copy data from old to new
    op.execute("""
        INSERT INTO game_results_new (
            id, created_at, updated_at, game_id, date,
            home_team_name, home_team_score, away_team_name, away_team_score,
            winner, prediction, confidence, model_id
        )
        SELECT
            id, created_at, updated_at, game_id, date,
            home_team_name, home_team_score, away_team_name, away_team_score,
            winner, prediction, confidence, model_id
        FROM game_results
    """)

    # Drop old table and rename new
    op.drop_table("game_results")
    op.execute("ALTER TABLE game_results_new RENAME TO game_results")

    # Create indexes on renamed table
    op.create_index("ix_game_results_date_model_id", "game_results", ["date", "model_id"])
    op.create_index("ix_game_results_game_id", "game_results", ["game_id"])
    op.create_index("ix_game_results_date", "game_results", ["date"])
    op.create_index("ix_game_results_model_id", "game_results", ["model_id"])


def _upgrade_postgresql() -> None:
    """PostgreSQL upgrade using standard ALTER operations."""
    # Check if model_id already exists (partial migration)
    model_id_exists = _column_exists("game_results", "model_id")

    if not model_id_exists:
        # Add model_id column (nullable initially)
        op.add_column("game_results", sa.Column("model_id", sa.Integer(), nullable=True))

    # Create foreign key if not exists
    if not _constraint_exists("game_results", "fk_game_results_ml_models"):
        op.create_foreign_key(
            "fk_game_results_ml_models",
            "game_results",
            "ml_models",
            ["model_id"],
            ["id"],
        )

    # Create new index on (date, model_id) if not exists
    if not _index_exists("game_results", "ix_game_results_date_model_id"):
        op.create_index(
            "ix_game_results_date_model_id",
            "game_results",
            ["date", "model_id"],
        )

    # Create new unique constraint on (game_id, model_id) if not exists
    if not _constraint_exists("game_results", "uq_game_results_game_model_id"):
        op.create_unique_constraint(
            "uq_game_results_game_model_id",
            "game_results",
            ["game_id", "model_id"],
        )

    # Populate model_id from ml_models lookup
    op.execute("""
        UPDATE game_results
        SET model_id = ml_models.id
        FROM ml_models
        WHERE game_results.model_name = ml_models.name
          AND game_results.model_id IS NULL
    """)

    # Drop old unique constraint if exists
    if _constraint_exists("game_results", "uq_game_results_game_model"):
        op.drop_constraint(
            "uq_game_results_game_model",
            "game_results",
            type_="unique",
        )

    # Drop old index on (date, model_name) if exists
    if _index_exists("game_results", "ix_game_results_date_model"):
        op.drop_index(
            "ix_game_results_date_model",
            table_name="game_results",
        )

    # Drop index on model_name if exists
    if _index_exists("game_results", "ix_game_results_model_name"):
        op.drop_index(
            "ix_game_results_model_name",
            table_name="game_results",
        )

    # Drop model_name column
    op.drop_column("game_results", "model_name")

    # Make model_id non-nullable
    op.alter_column(
        "game_results",
        "model_id",
        existing_type=sa.Integer(),
        nullable=False,
    )

    # Create index on model_id if not exists
    if not _index_exists("game_results", "ix_game_results_model_id"):
        op.create_index(
            "ix_game_results_model_id",
            "game_results",
            ["model_id"],
        )


def downgrade() -> None:
    dialect = op.get_context().dialect.name

    if dialect == "sqlite":
        _downgrade_sqlite()
    else:
        _downgrade_postgresql()


def _downgrade_sqlite() -> None:
    """SQLite downgrade using table recreation."""
    # Step 1: Add model_name column (nullable)
    op.add_column("game_results", sa.Column("model_name", sa.String(), nullable=True))

    # Step 2: Populate model_name from ml_models lookup
    op.execute("""
        UPDATE game_results
        SET model_name = (
            SELECT ml_models.name
            FROM ml_models
            WHERE ml_models.id = game_results.model_id
        )
    """)

    # Step 3: Recreate table with old schema
    op.create_table(
        "game_results_new",
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

    # Copy data from old to new
    op.execute("""
        INSERT INTO game_results_new (
            id, created_at, updated_at, game_id, date,
            home_team_name, home_team_score, away_team_name, away_team_score,
            winner, prediction, confidence, model_name
        )
        SELECT
            id, created_at, updated_at, game_id, date,
            home_team_name, home_team_score, away_team_name, away_team_score,
            winner, prediction, confidence, model_name
        FROM game_results
    """)

    # Drop old table and rename new
    op.drop_table("game_results")
    op.execute("ALTER TABLE game_results_new RENAME TO game_results")


def _downgrade_postgresql() -> None:
    """PostgreSQL downgrade using standard ALTER operations."""
    # Add back model_name column
    op.add_column("game_results", sa.Column("model_name", sa.String(), nullable=True))

    # Restore model_name from ml_models lookup
    op.execute("""
        UPDATE game_results
        SET model_name = ml_models.name
        FROM ml_models
        WHERE game_results.model_id = ml_models.id
    """)

    # Drop foreign key if exists
    if _constraint_exists("game_results", "fk_game_results_ml_models"):
        op.drop_constraint(
            "fk_game_results_ml_models",
            "game_results",
            type_="foreignkey",
        )

    # Drop new unique constraint if exists
    if _constraint_exists("game_results", "uq_game_results_game_model_id"):
        op.drop_constraint(
            "uq_game_results_game_model_id",
            "game_results",
            type_="unique",
        )

    # Drop new index if exists
    if _index_exists("game_results", "ix_game_results_date_model_id"):
        op.drop_index(
            "ix_game_results_date_model_id",
            table_name="game_results",
        )

    # Drop model_id index if exists
    if _index_exists("game_results", "ix_game_results_model_id"):
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

    # Create index on model_name
    op.create_index(
        "ix_game_results_model_name",
        "game_results",
        ["model_name"],
    )

    # Make model_name non-nullable
    op.alter_column(
        "game_results",
        "model_name",
        existing_type=sa.String(),
        nullable=False,
    )
