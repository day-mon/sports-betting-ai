import uuid

import sqlalchemy.orm


class IDMixin:
    id: sqlalchemy.orm.Mapped[int] = sqlalchemy.orm.mapped_column(
        primary_key=True,
        autoincrement=True,
    )


class UUIDPKMixin:
    id: sqlalchemy.orm.Mapped[uuid.UUID] = sqlalchemy.orm.mapped_column(
        primary_key=True,
        default=uuid.uuid7,
    )
