import typing

import pydantic
import pydantic_settings

from . import base


class SqliteSettings(pydantic_settings.BaseSettings):
    type: typing.Literal["sqlite"] = "sqlite"
    database: str

    @property
    def connection_url(self) -> str:
        return f"sqlite+aiosqlite:///{self.database}"


class PostgresSettings(pydantic_settings.BaseSettings):
    type: typing.Literal["postgres"] = "postgres"
    host: str
    port: int
    database: str
    username: str
    password: str

    @property
    def connection_url(self) -> str:
        return f"postgresql+asyncpg://{self.username}:{self.password}@{self.host}:{self.port}/{self.database}"


class Settings(base.Settings):
    db: typing.Annotated[
        SqliteSettings | PostgresSettings,
        pydantic.Field(discriminator="type"),
    ] = SqliteSettings(database="db.sqlite3")

    echo: bool = False
    expire_on_commit: bool = False

    model_config = pydantic_settings.SettingsConfigDict(
        **base.settings.model_config,
    )


settings = Settings()
