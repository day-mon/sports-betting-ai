from abc import ABC, abstractmethod
from typing import Union

from redis import Redis

from api.business.factory import AbstractFactory


class Cache(ABC):
    def __init__(self):
        pass

    @abstractmethod
    def get(self, key: str) -> Union[str, bytes, int, float, dict, list, tuple]:
        pass

    @abstractmethod
    def set(self, key: str, value: Union[str, bytes, int, float, dict, list, tuple]):
        pass


class RedisCache(Cache):
    connection_string: str
    redis_client: Redis

    def __init__(self, connection_string: str):
        super().__init__()
        self.redis_client = Redis.from_url(url=connection_string)

    def get(self, key: str) -> Union[str, bytes, int, float, dict, list, tuple, None]:
        return self.redis_client.get(key)

    def set(self, key: str, value: Union[str, bytes, int, float, dict, list, tuple]):
        return self.redis_client.set(key, value)


class CacheFactory(AbstractFactory):
    _values = {
        "redis": RedisCache,
    }