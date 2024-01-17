from abc import ABC, abstractmethod
from typing import Union, Dict

from redis import Redis
from loguru import logger
from api.business.factory import AbstractFactory, FactoryItem
from resources.config.cache import get_cache_settings, CacheSettings


class Cache(ABC):
    cache_settings: CacheSettings

    def __init__(self):
        self.cache_settings = get_cache_settings()

    @abstractmethod
    async def get(self, key: str) -> Union[str, bytes, int, float, dict, list, tuple]:
        pass

    @abstractmethod
    async def set(
        self, key: str, value: Union[str, bytes, int, float, dict, list, tuple]
    ):
        pass


class RedisCache(Cache):
    redis_client: Redis

    def __init__(self):
        super().__init__()
        self.redis_client = Redis(
            host=self.cache_settings.CACHE_HOST,
            port=self.cache_settings.CACHE_PORT,
            db=self.cache_settings.CACHE_NAME,
        )
        self.redis_client.ping()

    async def get(self, key: str) -> Union[str, bytes, int, float, dict, list, tuple]:
        item = self.redis_client.get(key)
        if isinstance(item, bytes):
            item = item.decode("utf-8")
        logger.debug(f"Cache hit for key: {key} -> {item}")
        return item

    async def set(
        self, key: str, value: Union[str, bytes, int, float, dict, list, tuple]
    ):
        return self.redis_client.set(key, value)


class CacheFactory(AbstractFactory):
    _values: dict[str, FactoryItem] = {
        "redis": FactoryItem(name="redis", factory_item=RedisCache),
    }
