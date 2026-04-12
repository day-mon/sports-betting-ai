import datetime
import sqlalchemy.orm


class LastUpdatedTimestampMixin:
    updated_at = sqlalchemy.orm.mapped_column(
        onupdate=lambda: datetime.datetime.now(datetime.timezone.utc),
    )
