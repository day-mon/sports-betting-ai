from __future__ import annotations

from typing import Any, List, Optional

from pydantic import BaseModel, ConfigDict
from pydantic.alias_generators import to_snake

from api import constants
from api.model.games.injury import InjuryItem

LOCATION_DATA  = {
    "ATL": {"name": "State Farm Arena", "city": "Atlanta", "state": "GA"},
    "BOS": {"name": "TD Garden", "city": "Boston", "state": "MA"},
    "BRK": {"name": "Barclays Center", "city": "Brooklyn", "state": "NY"},
    "CHA": {"name": "Spectrum Center", "city": "Charlotte", "state": "NC"},
    "CHI": {"name": "United Center", "city": "Chicago", "state": "IL"},
    "CLE": {"name": "Rocket Mortgage FieldHouse", "city": "Cleveland", "state": "OH"},
    "DAL": {"name": "American Airlines Center", "city": "Dallas", "state": "TX"},
    "DEN": {"name": "Ball Arena", "city": "Denver", "state": "CO"},
    "DET": {"name": "Little Caesars Arena", "city": "Detroit", "state": "MI"},
    "GSW": {"name": "Chase Center", "city": "San Francisco", "state": "CA"},
    "HOU": {"name": "Toyota Center", "city": "Houston", "state": "TX"},
    "IND": {"name": "Gainbridge Fieldhouse", "city": "Indianapolis", "state": "IN"},
    "LAC": {"name": "Crypto.com Arena", "city": "Los Angeles", "state": "CA"},
    "LAL": {"name": "Crypto.com Arena", "city": "Los Angeles", "state": "CA"},
    "MEM": {"name": "FedExForum", "city": "Memphis", "state": "TN"},
    "MIA": {"name": "FTX Arena", "city": "Miami", "state": "FL"},
    "MIL": {"name": "Fiserv Forum", "city": "Milwaukee", "state": "WI"},
    "MIN": {"name": "Target Center", "city": "Minneapolis", "state": "MN"},
    "NOP": {"name": "Smoothie King Center", "city": "New Orleans", "state": "LA"},
    "NYK": {"name": "Madison Square Garden", "city": "New York", "state": "NY"},
    "OKC": {"name": "Paycom Center", "city": "Oklahoma City", "state": "OK"},
    "ORL": {"name": "Amway Center", "city": "Orlando", "state": "FL"},
    "PHI": {"name": "Wells Fargo Center", "city": "Philadelphia", "state": "PA"},
    "PHX": {"name": "Footprint Center", "city": "Phoenix", "state": "AZ"},
    "POR": {"name": "Moda Center", "city": "Portland", "state": "OR"},
    "SAC": {"name": "Golden 1 Center", "city": "Sacramento", "state": "CA"},
    "SAS": {"name": "AT&T Center", "city": "San Antonio", "state": "TX"},
    "TOR": {"name": "Scotiabank Arena", "city": "Toronto", "state": "ON"},
    "UTA": {"name": "Vivint Arena", "city": "Salt Lake City", "state": "UT"},
    "WAS": {"name": "Capital One Arena", "city": "Washington D.C.", "state": "DC"},
}
class Meta(BaseModel):
    version: int
    request: str
    time: str
    code: int


class Period(BaseModel):
    period: int
    periodType: str
    score: int

    model_config = ConfigDict(
        alias_generator=to_snake,
        populate_by_name=True,
    )



class HomeTeam(BaseModel):
    teamId: int
    teamName: str
    teamCity: str
    teamTricode: str
    wins: int
    losses: int
    score: int
    seed: Any
    inBonus: Any
    timeoutsRemaining: int
    periods: List[Period]



class AwayTeam(BaseModel):
    teamId: int
    teamName: str
    teamCity: str
    teamTricode: str
    wins: int
    losses: int
    score: int
    seed: Any
    inBonus: Any
    timeoutsRemaining: int
    periods: List[Period]


class GamePlayerLeader(BaseModel):
    personId: int
    name: Optional[str]
    jerseyNum: Optional[str]
    position: Optional[str]
    teamTricode: Optional[str]
    playerSlug: Any
    points: int
    rebounds: int
    assists: int


class GameLeaders(BaseModel):
    homeLeaders: GamePlayerLeader
    awayLeaders: GamePlayerLeader

    def home_is_empty(self) -> bool:
        if not self.homeLeaders:
            return True

        return not self.homeLeaders.name

    def away_is_empty(self) -> bool:
        if not self.awayLeaders:
            return True

        return not self.awayLeaders.name



class PbOdds(BaseModel):
    team: Any
    odds: float
    suspended: int


class Game(BaseModel):
    gameId: str
    gameCode: str
    gameStatus: int
    gameStatusText: str
    period: int
    gameClock: str
    gameTimeUTC: str
    gameEt: str
    regulationPeriods: int
    ifNecessary: bool
    seriesGameNumber: str
    seriesText: str
    seriesConference: str
    poRoundDesc: str
    gameSubtype: str
    homeTeam: HomeTeam
    awayTeam: AwayTeam
    gameLeaders: Optional[GameLeaders] = None
    pbOdds: PbOdds


class Scoreboard(BaseModel):
    gameDate: str
    leagueId: str
    leagueName: str
    games: List[Game]


class NBALiveData(BaseModel):
    meta: Optional[Meta] = None
    scoreboard: Scoreboard


class PlayerLeader(BaseModel):
    name: Optional[str]
    points: Optional[int]
    rebounds: Optional[int]
    assists: Optional[int]


class TeamData(BaseModel):
    id: int
    city: str
    name: str
    score: Score
    wins: int
    losses: int
    abbreviation: str
    seed: Optional[int | str] = None
    leader: Optional[PlayerLeader] = None

class Score(BaseModel):
    points: int
    periods: list[Period]


class DailyGame(BaseModel):
    game_id: str
    game_date: str
    game_status: str
    game_start_unix: float
    home_team: TeamData
    away_team: TeamData


class Odds(BaseModel):
    book_name: str
    home_money_line: int
    away_money_line: int
    over_under: float
    num_bets: Optional[int] = None


class TeamDataExt(TeamData):
    injuries: list[InjuryItem]

class Location(BaseModel):
    name: str
    city: str
    state: str

NBA_STAD_DICT = {abbr: Location(**stadium) for abbr, stadium in LOCATION_DATA.items()}


class DailyGameResponse(BaseModel):
    id: str
    date: str
    status: str
    start_time_unix: float
    location: Optional[Location] = None
    home_team: TeamDataExt
    away_team: TeamDataExt
    odds: Optional[list[Odds]] = None

    def is_finished(self) -> bool:
        return self.status == "Final"

    @staticmethod
    def craft_response(
        games: list[DailyGame],
        injuries: list[InjuryItem],
        odds: Optional[dict[str, Odds]] = None,
    ) -> list[DailyGameResponse]:
        return [
            DailyGameResponse(
                id=game.game_id,
                date=game.game_date,
                start_time_unix=game.game_start_unix,
                location=NBA_STAD_DICT.get(game.home_team.abbreviation, None),
                status=game.game_status,
                home_team=TeamDataExt(
                    id=game.home_team.id,
                    name=game.home_team.name,
                    city=game.home_team.city,
                    score=game.home_team.score,
                    wins=game.home_team.wins,
                    losses=game.home_team.losses,
                    abbreviation=game.home_team.abbreviation,
                    leader=game.home_team.leader,
                    injuries=[
                        injury
                        for injury in injuries
                        if injury.team == game.home_team.abbreviation
                    ],
                ),
                away_team=TeamDataExt(
                    id=game.away_team.id,
                    name=game.away_team.name,
                    city=game.away_team.city,
                    score=game.away_team.score,
                    wins=game.away_team.wins,
                    losses=game.away_team.losses,
                    abbreviation=game.away_team.abbreviation,
                    leader=game.away_team.leader,
                    injuries=[
                        injury
                        for injury in injuries
                        if injury.team == game.away_team.abbreviation
                    ],
                ),
                odds=odds.get(
                    game.home_team.abbreviation,
                    odds.get(game.away_team.abbreviation, None),
                )
                if odds
                else None,
            )
            for game in games
        ]
