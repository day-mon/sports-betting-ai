from __future__ import annotations

from typing import Any, List, Optional, Union

from pydantic import BaseModel

from api.business.daily_games import DailyGame


class Parameters(BaseModel):
    MeasureType: str
    PerMode: str
    PlusMinus: str
    PaceAdjust: str
    Rank: str
    LeagueID: str
    Season: str
    SeasonType: str
    PORound: int
    Outcome: Any
    Location: Any
    Month: int
    SeasonSegment: Any
    DateFrom: Any
    DateTo: Any
    OpponentTeamID: int
    VsConference: Any
    VsDivision: Any
    TeamID: int
    Conference: Any
    Division: Any
    GameSegment: Any
    Period: int
    ShotClockRange: Any
    LastNGames: int
    GameScope: Any
    PlayerExperience: Any
    PlayerPosition: Any
    StarterBench: Any
    TwoWay: int
    GameSubtype: Any
    ISTRound: Any

class ModelFeature(BaseModel):
    name: str
    description: str
    friendly_name: str
class ModelInfo(BaseModel):
    name: str
    description: str
    features: List[ModelFeature]


class ResultSet(BaseModel):
    name: str
    headers: List[str]
    rowSet: List[List[Union[float, str]]]

    def get_team_stats(self, team_id: int) -> List[List[Union[float, str]]]:
        team_id_index = 0
        return [row for row in self.rowSet if row[team_id_index] == team_id]


class TeamStats(BaseModel):
    resource: str
    parameters: Parameters
    resultSets: List[ResultSet]
