import os
from functools import lru_cache
from typing import Literal, Optional

from pydantic import model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class CacheSettings(BaseSettings):
    TYPE: Literal["redis", "none"] = "none"
    CONNECTION_URL: Optional[str] = None
    DIR: Optional[str] = None
    HOST: Optional[str] = None
    PORT: Optional[int] = None
    NAME: Optional[int] = None
    PASSWORD: Optional[str] = None

    model_config = SettingsConfigDict(
        env_file=os.getenv(
            "ENV_FILE_OVERRIDE",
            f"./api/resources/env/{os.getenv('ENVIRONMENT', 'development')}.env",
        ),
        env_prefix="CACHE_",
    )

    @model_validator(mode='after')
    def check_type(self) -> 'CacheSettings':
        if self.TYPE == 'redis':
            if self.HOST is None:
                raise ValueError('Cache requires HOST')
            if self.PORT is None:
                raise ValueError('Cache requires PORT')
            if self.NAME is None:
                raise ValueError(f'Cache requires NAME name {self.NAME}')
        return self


@lru_cache
def get_cache_settings():
    return CacheSettings()
