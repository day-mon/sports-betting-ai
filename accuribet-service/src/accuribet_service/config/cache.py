import typing
import pydantic
import pydantic_settings
from . import base


class RedisSettings(pydantic.BaseModel):
    type: typing.Literal['redis'] = 'redis'
    host: str
    port: int = 6379
    password: str | None = None
    database: int = 0

    @property
    def connection_url(self) -> str:
        auth = f":{self.password}@" if self.password else ""
        return f"redis://{auth}{self.host}:{self.port}/{self.database}"


class MemorySettings(pydantic.BaseModel):
    type: typing.Literal['memory'] = 'memory'

    @property
    def connection_url(self) -> str:
        return "memory://"


class CacheSettings(pydantic_settings.BaseSettings):
    cache: typing.Annotated[
        RedisSettings | MemorySettings,
        pydantic.Field(discriminator='type')
    ] = MemorySettings()

    model_config = pydantic_settings.SettingsConfigDict(
        **base.settings.model_config,
    )