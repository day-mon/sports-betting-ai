"""Create ml_models table.

Revision ID: 002
Revises: 001
Create Date: 2026-05-01 00:00:00.000000

"""

from __future__ import annotations

import typing

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = "002"
down_revision: str = "001"
branch_labels: str | typing.Sequence[str] | None = None
depends_on: str | typing.Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "ml_models",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), nullable=False),
        sa.Column("name", sa.String(length=255), nullable=False),
        sa.Column("type", sa.String(length=20), nullable=False),
        sa.Column("path", sa.String(length=512), nullable=False),
        sa.Column(
            "version", sa.String(length=50), nullable=False, server_default="1.0.0"
        ),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default="true"),
        sa.Column("description", sa.Text(), nullable=True),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("name", name="uq_ml_models_name"),
        sa.Index("ix_ml_models_name", "name"),
        sa.Index("ix_ml_models_type", "type"),
        sa.Index("ix_ml_models_is_active", "is_active"),
    )


def downgrade() -> None:
    op.drop_table("ml_models")
