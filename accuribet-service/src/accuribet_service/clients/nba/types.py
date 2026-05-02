"""Pydantic models for NBA API responses."""

from __future__ import annotations

import datetime

import pydantic
from pydantic.alias_generators import to_camel


class _CamelModel(pydantic.BaseModel):
    """Base model that accepts camelCase from the NBA API but uses snake_case internally."""

    model_config = pydantic.ConfigDict(
        alias_generator=to_camel,
        populate_by_name=True,
    )


class Period(_CamelModel):
    period: int
    period_type: str
    score: int


class Team(_CamelModel):
    team_id: int
    team_name: str
    team_city: str
    team_tricode: str
    wins: int
    losses: int
    score: int
    seed: int | str | None = None
    periods: list[Period]


class PlayerLeader(_CamelModel):
    name: str | None = None
    points: int | None = None
    rebounds: int | None = None
    assists: int | None = None


class GameLeaders(_CamelModel):
    home_leaders: PlayerLeader
    away_leaders: PlayerLeader


class Game(_CamelModel):
    game_id: str
    game_date: str = pydantic.Field(
        default_factory=lambda: datetime.datetime.now(datetime.timezone.utc).strftime("%Y-%m-%d"),
    )
    game_status_text: str
    game_time_utc: str = pydantic.Field(
        default_factory=lambda: datetime.datetime.now(datetime.timezone.utc).strftime(
            "%Y-%m-%dT%H:%M:%SZ"
        ),
        alias="gameTimeUTC",
    )
    home_team: Team
    away_team: Team
    game_leaders: GameLeaders | None = None


class Scoreboard(_CamelModel):
    game_date: str = pydantic.Field(
        default_factory=lambda: datetime.datetime.now(datetime.timezone.utc).strftime("%Y-%m-%d"),
    )
    games: list[Game]


class NBAResponse(_CamelModel):
    scoreboard: Scoreboard
