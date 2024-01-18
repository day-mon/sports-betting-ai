from abc import ABC, abstractmethod
from typing import Optional
from loguru import logger
import asyncpg
from asyncpg import Record

from api.business.factory import AbstractFactory, FactoryItem


from loguru import logger

from resources.config.database import DatabaseSettings, get_database_settings


class Database(ABC):
    db_settings: DatabaseSettings

    def __init__(self):
        self.db_settings = get_database_settings()

    @abstractmethod
    async def query(self, query: str, values: Optional[list] = None):
        pass

    @abstractmethod
    async def connect(self):
        pass

    @abstractmethod
    async def close(self):
        pass


class Postgres(Database):
    def __init__(self):
        super().__init__()
        self.user = self.db_settings.DATABASE_USER
        self.password = self.db_settings.DATABASE_PASSWORD
        self.host = self.db_settings.DATABASE_HOST
        self.port = self.db_settings.DATABASE_PORT
        self.database = self.db_settings.DATABASE_NAME
        self._cursor = None

        self._connection_pool = None
        self.con = None

    def close(self):
        if self._connection_pool:
            self._connection_pool.close()

    async def connect(self):
        if not self._connection_pool:
            try:
                self._connection_pool = await asyncpg.create_pool(
                    min_size=1,
                    max_size=10,
                    command_timeout=60,
                    host=self.host,
                    port=self.port,
                    user=self.user,
                    password=self.password,
                    database=self.database,
                )

            except Exception as e:
                print(e)

    async def query(self, query: str, values: Optional[list] = None) -> list[Record]:
        if not self._connection_pool:
            await self.connect()

        logger.debug(f"Query: {query}")

        if values:
            values = tuple(values)

        self.con = await self._connection_pool.acquire()
        try:
            cursor = await self.con.fetch(query, *values)
            logger.debug(f"Result: {cursor}")
            return cursor
        except Exception as e:
            logger.error(f"Error has occurred during a query: {e}")
            raise e
        finally:
            await self._connection_pool.release(self.con)


class DatabaseFactory(AbstractFactory):
    _values = {"postgres": FactoryItem(name="postgres", factory_item=Postgres)}
