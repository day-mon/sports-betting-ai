import os
from functools import lru_cache
from typing import Literal, Optional

from pydantic import model_validator
from pydantic_settings import SettingsConfigDict

from resources.config.application import AppBaseSettings


class DatabaseSettings(AppBaseSettings):
    DATABASE_TYPE: Literal["postgres", "sqlite", "none"] = "none"
    DATABASE_HOST: Optional[str] = None
    DATABASE_PORT: Optional[int] = None
    DATABASE_NAME: Optional[str] = None
    DATABASE_USER: Optional[str] = None
    DATABASE_PASSWORD: Optional[str] = None

    @model_validator(mode="after")
    def check_type(self) -> "DatabaseSettings":
        if self.DATABASE_TYPE == "none":
            return self

        if self.DATABASE_NAME is None:
            raise ValueError(f"Database requires NAME name {self.DATABASE_NAME}")

        if self.DATABASE_TYPE == "sqlite":
            return self

        if self.DATABASE_HOST is None:
            raise ValueError("Database requires HOST")
        if self.DATABASE_PORT is None:
            raise ValueError("Database requires PORT")
        if self.DATABASE_USER is None:
            raise ValueError(f"Database requires USER name {self.DATABASE_USER}")
        if self.DATABASE_PASSWORD is None:
            raise ValueError(
                f"Database requires PASSWORD name {self.DATABASE_PASSWORD}"
            )
        return self

    @property
    def sqlite_database_url(self) -> str:
        return f"sqlite:///{self.DATABASE_NAME}"

    @property
    def pg_database_url(self) -> str:
        return f"postgresql://{self.DATABASE_USER}:{self.DATABASE_PASSWORD}@{self.DATABASE_HOST}:{self.DATABASE_PORT}/{self.DATABASE_NAME}"


@lru_cache
def get_database_settings():
    return DatabaseSettings()
