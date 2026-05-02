from __future__ import annotations

import datetime

import sqlalchemy.orm


class LastUpdatedTimestampMixin:
    """Mixin that adds an ``updated_at`` column.

    The column is automatically set to the current UTC timestamp
    whenever the row is updated.

    attributes:
        updated_at: Timestamp of the last update (UTC).
    """

    updated_at: sqlalchemy.orm.Mapped[datetime.datetime] = sqlalchemy.orm.mapped_column(
        index=True,
        onupdate=lambda: datetime.datetime.now(datetime.timezone.utc),
    )
