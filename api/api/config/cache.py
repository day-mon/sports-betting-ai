import os
from functools import lru_cache
from typing import Literal, Optional

from pydantic import model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

from api.config.application import AppBaseSettings


class CacheSettings(AppBaseSettings):
    CACHE_TYPE: Literal["redis", "none"] = "none"
    CACHE_CONNECTION_URL: Optional[str] = None
    CACHE_DIR: Optional[str] = None
    CACHE_HOST: Optional[str] = None
    CACHE_PORT: Optional[int] = None
    CACHE_NAME: Optional[int] = None
    CACHE_PASSWORD: Optional[str] = None

    model_config = SettingsConfigDict(
        env_file=os.getenv(
            "ENV_FILE_OVERRIDE",
            f"./api/resources/env/{os.getenv('ENVIRONMENT', 'development')}.env",
        ),
    )

    @model_validator(mode="after")
    def check_type(self) -> "CacheSettings":
        if self.CACHE_TYPE == "redis":
            if self.CACHE_HOST is None:
                raise ValueError("Cache requires HOST")
            if self.CACHE_PORT is None:
                raise ValueError("Cache requires PORT")
            if self.CACHE_NAME is None:
                raise ValueError(f"Cache requires NAME name {self.CACHE_NAME}")
        return self


@lru_cache
def get_cache_settings():
    return CacheSettings()
