from asyncpg import Record
from pydantic import ConfigDict, BaseModel

from api.business.database import Database
from api.business.model import PredictionModel


class AccuracyModel(BaseModel):
    model_name: str
    accuracy: float
    model_config = ConfigDict(protected_namespaces=())

    @staticmethod
    async def from_db(model: PredictionModel, db: Database) -> "AccuracyModel":
        query_dates: list[Record] = await db.query(
            model.accuracy_statement(), values=[model.model_name]
        )
        return AccuracyModel(
            model_name=query_dates[0]["model_name"], accuracy=query_dates[0]["win_rate"]
        )
