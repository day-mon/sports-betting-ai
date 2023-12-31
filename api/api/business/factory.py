from functools import lru_cache
from typing import Any
from loguru import logger


class AbstractFactory:
    _values: dict[str, Any] = {}
    @classmethod
    def create(cls, name: str, **kwargs):
        factory_item = cls._values.get(name)
        return factory_item(**kwargs)

    @classmethod
    @lru_cache
    def compute_or_get(cls, name: str, **kwargs):
        logger.debug(f"Cold init for {name}")
        return cls.create(name, **kwargs)