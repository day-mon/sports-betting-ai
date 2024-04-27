from functools import lru_cache
from typing import Literal, Optional
from pydantic_settings import BaseSettings, SettingsConfigDict
import os


class AppBaseSettings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=os.getenv(
            "ENV_FILE_OVERRIDE",
            f"./resources/env/{os.getenv('ENVIRONMENT', 'development')}.env",
        ),
        extra="ignore",
    )


class AppSettings(AppBaseSettings):
    ENVIRONMENT: Literal["development", "production"] = "development"
    DAILY_GAMES_SOURCE: Literal["nba"] = "nba"
    PLAYER_INJURY_SOURCE: Literal["rotowire"] = "rotowire"
    ODDS_SOURCE: Literal["actionnetwork"] = "actionnetwork"
    MODEL_DIR: str
    DATA_DIR: str
    CF_WORKER_URL: str


@lru_cache
def get_settings():
    return AppSettings()