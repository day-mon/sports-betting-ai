from __future__ import annotations

import typing

import pydantic


class DateListItem(pydantic.BaseModel):
    """Distinct dates that have saved game results per model."""

    model_name: str
    dates: list[str]


class GameHistoryItem(pydantic.BaseModel):
    """A single saved game result with prediction details."""

    game_id: str
    date: str
    home_team_name: str
    home_team_score: int
    away_team_name: str
    away_team_score: int
    winner: str
    prediction: str
    prediction_was_correct: bool | None
    confidence: float | None
    model_name: str


class PaginatedGameHistory(pydantic.BaseModel):
    """Paginated list of game results."""

    items: list[GameHistoryItem]
    total: int
    page: int
    page_size: int


class WinLossAccuracyResponse(pydantic.BaseModel):
    """Accuracy stats for a win-loss prediction model."""

    type: typing.Literal["win-loss"] = "win-loss"
    model_name: str
    win_rate: float
    total_games: int
    total_correct: int


class OverUnderAccuracyResponse(pydantic.BaseModel):
    """Accuracy stats for an over-under prediction model."""

    type: typing.Literal["over-under"] = "over-under"
    model_name: str
    avg_error: float
    total_games: int


AccuracyResponse = WinLossAccuracyResponse | OverUnderAccuracyResponse
