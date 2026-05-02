import typing

import fastapi
from cashews import cache as global_cache
from cashews.wrapper import Cache


def get_cache(request: fastapi.Request) -> Cache:
    return global_cache


CacheDep = typing.Annotated[Cache, fastapi.Depends(get_cache)]
