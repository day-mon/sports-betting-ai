from typing import Optional

from asyncpg import Record
from pydantic import ConfigDict, BaseModel

from api.business.database import Database
from api.business.model import PredictionModel


class AccuracyModel(BaseModel):
    model_name: str
    win_rate: float
    total_games: Optional[int] = None
    total_correct: Optional[int] = None
    model_config = ConfigDict(protected_namespaces=(), extra="allow")

    @staticmethod
    async def from_db(model: PredictionModel, db: Database) -> "AccuracyModel":
        query_dates: list[Record] = await db.query(
            model.accuracy_statement(), values=[model.model_name]
        )
        return AccuracyModel(
            **query_dates[0],
        )
