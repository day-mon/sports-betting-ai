from __future__ import annotations

import typing

import pydantic

from . import base


class Settings(base.Settings):
    host: str = "0.0.0.0"
    port: int = 8000
    log_type: typing.Literal["json", "normal"] = "normal"
    log_level: typing.Literal["DEBUG", "INFO", "WARNING", "ERROR", "CRITICAL"] = "INFO"
    environment: typing.Literal["development", "production"] = "development"

    @property
    def reload(self) -> bool:
        return self.environment == "development"

    @pydantic.model_validator(mode="after")
    def validate_prod_reload(self) -> Settings:
        if self.environment == "production" and self.reload:
            raise ValueError("Reload cannot be enabled in a production environment")
        return self

    # Cache TTL settings (seconds)
    games_cache_ttl: int = 300  # 5 minutes
    injuries_cache_ttl: int = 900  # 15 minutes
    odds_cache_ttl: int = 120  # 2 minutes

    @property
    def is_json_logs(self) -> bool:
        return self.log_type == "json"


settings = Settings()
