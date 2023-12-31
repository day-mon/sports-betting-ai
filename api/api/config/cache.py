import os
from typing import Literal, Optional

from pydantic_settings import BaseSettings, SettingsConfigDict


class CacheSettings(BaseSettings):
    CACHE_TYPE: Literal["disk", "redis"] = "redis"
    CACHE_CONNECTION_URL: Optional[str] = None
    CACHE_DIR: Optional[str] = None
    CACHE_HOST: Optional[str] = None
    CACHE_PORT: Optional[int] = None
    CACHE_DB: Optional[int] = None
    CACHE_PASSWORD: Optional[str] = None


    model_config = SettingsConfigDict(
        env_file=os.getenv(
            "ENV_FILE_OVERRIDE", f"./api/resources/env/{os.getenv('ENVIRONMENT', 'development')}.env"
        ),
        env_prefix="CACHE_"

    )



