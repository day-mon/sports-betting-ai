from __future__ import annotations

import typing

import fastapi

from accuribet_service.api.v1.games import schemas, service

router = fastapi.APIRouter(
    prefix="/games",
    tags=["games"],
)


def get_games_service(
    request: fastapi.Request,
) -> service.GamesService:
    return request.app.state.games_service


GamesServiceDep = typing.Annotated[
    service.GamesService,
    fastapi.Depends(get_games_service),
]


@router.get(
    "/daily",
    response_model=list[schemas.DailyGameResponse],
    responses={
        424: {"description": "Dependency failed - external API error"},
    },
)
async def get_daily_games(
    svc: GamesServiceDep,
    with_odds: typing.Annotated[bool, fastapi.Query()] = True,
) -> list[schemas.DailyGameResponse]:
    """Get daily games with injuries and optional odds.

    Returns all NBA games for today with team data, player injuries,
    and optionally betting odds from multiple bookmakers.
    """
    return await svc.get_daily_games(with_odds=with_odds)
