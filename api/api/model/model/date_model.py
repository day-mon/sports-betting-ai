from asyncpg import Record
from pydantic import BaseModel, ConfigDict

from api.business.database import Database
from loguru import logger


class DateModel(BaseModel):
    dates: list[str]
    model_name: str

    model_config = ConfigDict(protected_namespaces=())

    @staticmethod
    async def from_db(models: list[str], db: Database) -> list["DateModel"]:
        dates: list["DateModel"] = []
        for model in models:
            query = f"""SELECT DISTINCT date
                FROM saved_games
                WHERE model_name = $1
                ORDER BY date DESC """
            query_dates: list[Record] = await db.query(query, values=[model])
            str_dates = [date["date"] for date in query_dates]
            dates.append(DateModel(dates=str_dates, model_name=model))

        return dates
