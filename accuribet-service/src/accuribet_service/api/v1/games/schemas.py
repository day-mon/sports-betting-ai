from __future__ import annotations

import pydantic


class Period(pydantic.BaseModel):
    """A single period/quarter score."""

    period: int
    period_type: str
    score: int


class Score(pydantic.BaseModel):
    """Team score with period breakdown."""

    points: int
    periods: list[Period]


class PlayerLeader(pydantic.BaseModel):
    """Leading player stats for a team."""

    name: str | None = None
    points: int | None = None
    rebounds: int | None = None
    assists: int | None = None


class TeamData(pydantic.BaseModel):
    """Core team information."""

    id: int
    city: str
    name: str
    score: Score
    wins: int
    losses: int
    abbreviation: str
    seed: int | str | None = None
    leader: PlayerLeader | None = None

    @property
    def full_name(self) -> str:
        return f"{self.city} {self.name}"


class InjuryItem(pydantic.BaseModel):
    """Player injury information."""

    player: str
    team: str
    position: str
    injury: str
    status: str


class TeamDataWithInjuries(TeamData):
    """Team data including injuries."""

    injuries: list[InjuryItem]


class Odds(pydantic.BaseModel):
    """Betting odds from a bookmaker."""

    book_name: str
    home_money_line: int
    away_money_line: int
    over_under: float
    num_bets: int | None = None


class Location(pydantic.BaseModel):
    """Stadium/arena location."""

    name: str
    city: str
    state: str


class DailyGameResponse(pydantic.BaseModel):
    """Complete daily game response with all data."""

    id: str
    date: str
    status: str
    start_time_unix: float
    location: Location | None = None
    home_team: TeamDataWithInjuries
    away_team: TeamDataWithInjuries
    odds: list[Odds] | None = None

    def is_finished(self) -> bool:
        return self.status == "Final"
