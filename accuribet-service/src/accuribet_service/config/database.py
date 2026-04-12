import typing

import pydantic

from . import base


class SqliteSettings(pydantic.BaseModel):
    type: typing.Literal["sqlite"] = "sqlite"
    database: str = "db.sqlite3"

    @property
    def connection_url(self) -> str:
        return f"sqlite+aiosqlite:///{self.database}"


class PostgresSettings(pydantic.BaseModel):
    type: typing.Literal["postgres"] = "postgres"
    host: str
    port: int = 5432
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
    ] = pydantic.Field(default_factory=SqliteSettings)

    echo: bool = False
    expire_on_commit: bool = False


settings = Settings()
