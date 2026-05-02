import uuid

import sqlalchemy.orm


class IDMixin:
    """Mixin that adds an auto-incrementing integer primary key column.

    attributes:
        id: Auto-incrementing integer primary key.
    """

    id: sqlalchemy.orm.Mapped[int] = sqlalchemy.orm.mapped_column(
        primary_key=True,
        autoincrement=True,
    )


class UUIDPKMixin:
    """Mixin that adds a UUID primary key column using UUIDv7.

    UUIDv7 provides time-ordered, globally unique identifiers.

    attributes:
        id: UUID primary key, defaulting to ``uuid.uuid7``.
    """

    id: sqlalchemy.orm.Mapped[uuid.UUID] = sqlalchemy.orm.mapped_column(
        primary_key=True,
        default=uuid.uuid7,
    )
