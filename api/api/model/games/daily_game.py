from __future__ import annotations

from typing import Any, List, Optional

from pydantic import BaseModel

from api.model.games.injury import InjuryItem


class Meta(BaseModel):
    version: int
    request: str
    time: str
    code: int


class Period(BaseModel):
    period: int
    periodType: str
    score: int


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


class Period1(BaseModel):
    period: int
    periodType: str
    score: int


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
    periods: List[Period1]


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
        if self.homeLeaders is None:
            return True

        if self.homeLeaders.name is None:
            return True

        return False

    def away_is_empty(self) -> bool:
        if self.awayLeaders is None:
            return True

        if self.awayLeaders.name is None:
            return True

        return False


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
    name: str
    score: int
    wins: int
    losses: int
    abbreviation: str
    leader: Optional[PlayerLeader] = None


class DailyGame(BaseModel):
    game_id: str
    game_date: str
    game_status: str
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


class DailyGameResponse(BaseModel):
    id: str
    date: str
    status: str
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
                status=game.game_status,
                home_team=TeamDataExt(
                    id=game.home_team.id,
                    name=game.home_team.name,
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
