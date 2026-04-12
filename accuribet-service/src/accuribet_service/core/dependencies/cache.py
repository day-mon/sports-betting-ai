import typing

import fastapi
from accuribet_service.config.cache import settings
from cashews import Cache


def create() -> Cache:
    instance = Cache()
    instance.setup(settings.cache.connection_url)
    return instance


def get_cache(request: fastapi.Request) -> Cache:
    return request.app.state.cache


CacheDep = typing.Annotated[Cache, fastapi.Depends(get_cache)]
