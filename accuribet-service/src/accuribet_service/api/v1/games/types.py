"""Internal types for games module with factory methods."""

from __future__ import annotations

import dataclasses
import datetime
from datetime import timezone

from accuribet_service.api.v1.games import constants
from accuribet_service.clients.actionnetwork import types as actionnetwork_types
from accuribet_service.clients.nba import types as nba_types
from accuribet_service.clients.rotowire import types as rotowire_types


@dataclasses.dataclass
class Period:
    period: int
    period_type: str
    score: int

    @classmethod
    def from_nba(cls, p: nba_types.Period) -> Period:
        return cls(period=p.period, period_type=p.period_type, score=p.score)


@dataclasses.dataclass
class Score:
    points: int
    periods: list[Period]

    @classmethod
    def from_nba(cls, team: nba_types.Team) -> Score:
        return cls(
            points=team.score,
            periods=[Period.from_nba(p) for p in team.periods],
        )


@dataclasses.dataclass
class PlayerLeader:
    name: str | None = None
    points: int | None = None
    rebounds: int | None = None
    assists: int | None = None

    @classmethod
    def from_nba(cls, leader: nba_types.PlayerLeader) -> PlayerLeader | None:
        if not leader.name:
            return None
        return cls(
            name=leader.name,
            points=leader.points,
            rebounds=leader.rebounds,
            assists=leader.assists,
        )


@dataclasses.dataclass
class TeamData:
    id: int
    city: str
    name: str
    score: Score
    wins: int
    losses: int
    abbreviation: str
    seed: int | str | None = None
    leader: PlayerLeader | None = None

    @classmethod
    def from_nba(cls, team: nba_types.Team, leader: PlayerLeader | None) -> TeamData:
        return cls(
            id=team.team_id,
            city=team.team_city,
            name=team.team_name,
            score=Score.from_nba(team),
            wins=team.wins,
            losses=team.losses,
            abbreviation=team.team_tricode,
            seed=team.seed,
            leader=leader,
        )


@dataclasses.dataclass
class InjuryItem:
    player: str
    team: str
    position: str
    injury: str
    status: str

    @classmethod
    def from_rotowire(cls, item: rotowire_types.InjuryItem) -> InjuryItem:
        return cls(
            player=item.player,
            team=item.team,
            position=item.position,
            injury=item.injury,
            status=item.status,
        )


@dataclasses.dataclass
class TeamDataWithInjuries(TeamData):
    injuries: list[InjuryItem] = dataclasses.field(default_factory=list)

    @classmethod
    def from_team_data(cls, team: TeamData, injuries: list[InjuryItem]) -> TeamDataWithInjuries:
        return cls(
            id=team.id,
            city=team.city,
            name=team.name,
            score=team.score,
            wins=team.wins,
            losses=team.losses,
            abbreviation=team.abbreviation,
            seed=team.seed,
            leader=team.leader,
            injuries=injuries,
        )


@dataclasses.dataclass
class Odds:
    book_name: str
    home_money_line: int
    away_money_line: int
    over_under: float
    num_bets: int | None = None

    @classmethod
    def from_actionnetwork(cls, odd: actionnetwork_types.OddsData) -> Odds | None:
        if odd.book_id in constants.BOOK_IDS_TO_SKIP:
            return None
        return cls(
            book_name=constants.BOOKMAKER_NAMES.get(odd.book_id, "Unknown"),
            home_money_line=odd.ml_home,
            away_money_line=odd.ml_away,
            over_under=odd.total,
            num_bets=odd.num_bets,
        )


@dataclasses.dataclass
class Location:
    name: str
    city: str
    state: str

    @classmethod
    def from_abbreviation(cls, abbreviation: str) -> Location | None:
        loc_data = constants.LOCATION_DATA.get(abbreviation)
        if not loc_data:
            return None
        return cls(
            name=loc_data["name"],
            city=loc_data["city"],
            state=loc_data["state"],
        )


@dataclasses.dataclass
class DailyGameResponse:
    id: str
    date: str
    status: str
    start_time_unix: float
    location: Location | None
    home_team: TeamDataWithInjuries
    away_team: TeamDataWithInjuries
    odds: list[Odds] | None

    def is_finished(self) -> bool:
        return self.status == "Final"


@dataclasses.dataclass
class RawGameData:
    game_id: str
    game_date: str
    game_status: str
    game_start_unix: float
    home_team: TeamData
    away_team: TeamData

    @classmethod
    def from_nba(cls, game: nba_types.Game) -> RawGameData:
        game_time_str = game.game_time_utc
        try:
            dt = datetime.datetime.strptime(game_time_str, "%Y-%m-%dT%H:%M:%SZ")
            unix_timestamp = dt.replace(tzinfo=timezone.utc).timestamp()
        except ValueError:
            unix_timestamp = 0.0

        home_leader = (
            None if not game.game_leaders else PlayerLeader.from_nba(game.game_leaders.home_leaders)
        )

        away_leader = (
            None if not game.game_leaders else PlayerLeader.from_nba(game.game_leaders.away_leaders)
        )

        return cls(
            game_id=game.game_id,
            game_date=game.game_date,
            game_status=game.game_status_text,
            game_start_unix=unix_timestamp,
            home_team=TeamData.from_nba(game.home_team, home_leader),
            away_team=TeamData.from_nba(game.away_team, away_leader),
        )
