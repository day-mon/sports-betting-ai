from functools import lru_cache
from typing import Literal, Optional
from pydantic_settings import BaseSettings, SettingsConfigDict
import os


class AppSettings(BaseSettings):
    ENVIRONMENT: Literal["development", "production"] = "development"
    DAILY_GAMES_SOURCE: Literal["nba"] = "nba"
    PLAYER_INJURY_SOURCE: Literal["rotowire"] = "rotowire"
    ODDS_SOURCE: Literal["actionnetwork"] = "actionnetwork"
    MODEL_DIR: str
    DATA_DIR: str
    CF_WORKER_URL: str
    model_config = SettingsConfigDict(
        env_file=os.getenv(
            "ENV_FILE_OVERRIDE",
            f"./api/resources/env/{os.getenv('ENVIRONMENT', 'development')}.env",
        ),
        extra="ignore",
    )


@lru_cache
def get_settings():
    return AppSettings()
