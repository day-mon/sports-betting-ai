import typing

import fastapi
from accuribet_service.config import cache
from cashews import Cache


def create() -> Cache:
    instance = Cache()
    instance.setup(cache.settings.cache.connection_url)
    return instance


def get_cache(request: fastapi.Request) -> Cache:
    return request.app.state.cache


CacheDep = typing.Annotated[Cache, fastapi.Depends(get_cache)]
