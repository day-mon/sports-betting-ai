from __future__ import annotations

import typing


class WinLossAccuracy(typing.TypedDict):
    """Internal shape for win-loss model accuracy results."""

    type: typing.Literal["win-loss"]
    model_name: str
    win_rate: float
    total_games: int
    total_correct: int


class OverUnderAccuracy(typing.TypedDict):
    """Internal shape for over-under model accuracy results."""

    type: typing.Literal["over-under"]
    model_name: str
    avg_error: float
    total_games: int


Accuracy = WinLossAccuracy | OverUnderAccuracy


class DateListItem(typing.TypedDict):
    """Internal shape for distinct dates per model."""

    model_name: str
    dates: list[str]


class GameHistoryItem(typing.TypedDict):
    """Internal shape for a single game result with prediction details."""

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


class PaginatedGameHistory(typing.TypedDict):
    """Internal shape for paginated game results."""

    items: list[GameHistoryItem]
    total: int
    page: int
    page_size: int
