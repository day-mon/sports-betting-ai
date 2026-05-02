import typing

import sqlalchemy
import sqlalchemy.orm

from ..models import Base, mixins


class Prediction(
    Base, mixins.IDMixin, mixins.LastUpdatedTimestampMixin, mixins.CRUDMixin
):
    type: sqlalchemy.orm.Mapped[typing.Literal["win-loss"]] = (
        sqlalchemy.orm.mapped_column()
    )
    game_id: sqlalchemy.orm.Mapped[int] = sqlalchemy.orm.mapped_column(
        sqlalchemy.Integer(),
    )
