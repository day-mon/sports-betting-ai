"""Pydantic models for ActionNetwork API responses."""

from __future__ import annotations

import pydantic


class OddsData(pydantic.BaseModel):
    book_id: int
    ml_home: int
    ml_away: int
    total: float
    num_bets: int | None = None


class Team(pydantic.BaseModel):
    abbr: str


class Game(pydantic.BaseModel):
    teams: list[Team]
    odds: list[OddsData]


class ActionNetworkResponse(pydantic.BaseModel):
    games: list[Game]
