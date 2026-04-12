import datetime

import sqlalchemy.orm


class LastUpdatedTimestampMixin:
    updated_at: sqlalchemy.orm.Mapped[datetime.datetime] = sqlalchemy.orm.mapped_column(
        onupdate=datetime.datetime.now(datetime.UTC),
    )
