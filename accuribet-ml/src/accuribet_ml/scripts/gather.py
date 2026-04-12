"""
Usage:
    python fetch_nba_data.py
    python fetch_nba_data.py --start 2015 --end 2024 --delay 1.5
    python fetch_nba_data.py --no-playoffs --out ./my_data
    python fetch_nba_data.py --skip-fetch   # re-engineer features from existing CSV
"""

import argparse
import sys
from pathlib import Path

import numpy as np
import pandas as pd
import trio
from nba_api.stats.endpoints import leaguegamefinder
from nba_api.stats.library.parameters import SeasonTypeAllStar

SEASON_TYPES = [
    ("Regular Season", SeasonTypeAllStar.regular),
    ("Playoffs", SeasonTypeAllStar.playoffs),
]
WINDOWS = [5, 10]
ROLL_COLS = [
    "PTS",
    "FGM",
    "FGA",
    "FG_PCT",
    "FG3M",
    "FG3A",
    "FG3_PCT",
    "FTM",
    "FTA",
    "FT_PCT",
    "OREB",
    "DREB",
    "REB",
    "AST",
    "STL",
    "BLK",
    "TOV",
    "PF",
    "PLUS_MINUS",
    "OFF_RTG",
    "TS_PCT",
    "AST_TO",
    "DEF_PROXY",
    "THREE_RATE",
    "FT_RATE",
]


def year_to_season(y: int) -> str:
    return f"{y}-{str(y + 1)[-2:]}"


async def fetch_one(
    season: str, label: str, stype: str, delay: float
) -> pd.DataFrame | None:
    try:
        finder = await trio.to_thread.run_sync(
            lambda: leaguegamefinder.LeagueGameFinder(
                season_nullable=season,
                season_type_nullable=stype,
                league_id_nullable="00",
            ),
        )
        df = finder.get_data_frames()[0]
        if df.empty:
            return None
        df["SEASON"] = season
        df["SEASON_TYPE"] = label
        return df
    except Exception as e:
        print(f"  ⚠ {season} {label}: {e}", file=sys.stderr)
        return None


async def fetch_all(args: argparse.Namespace) -> pd.DataFrame:
    data_dir = trio.Path(args.out)
    await data_dir.mkdir(0o777, parents=True, exist_ok=True)
    season_types = SEASON_TYPES if not args.no_playoffs else SEASON_TYPES[:1]
    seasons = [year_to_season(y) for y in range(args.start, args.end + 1)]
    total = len(seasons) * len(season_types)
    done = 0
    all_frames = []

    print(f"Fetching {total} calls (~{total * args.delay / 60:.1f} min)\n")

    for season in seasons:
        season_frames = []
        for label, stype in season_types:
            done += 1
            print(f"  [{done}/{total}] {season} {label} ...", end=" ", flush=True)
            df = await fetch_one(season, label, stype, args.delay)
            if df is not None:
                season_frames.append(df)
                print(f"✓ {len(df):,} rows")
            else:
                print("(empty)")
            await trio.sleep(args.delay)

        if season_frames:
            season_df = pd.concat(season_frames, ignore_index=True)
            all_frames.append(season_df)
            path = data_dir / f"games_{season.replace('-', '_')}.csv"
            await trio.to_thread.run_sync(
                lambda p=path, d=season_df: d.to_csv(p, index=False)
            )

    if not all_frames:
        raise RuntimeError("No data fetched.")

    master = pd.concat(all_frames, ignore_index=True)
    master["GAME_DATE"] = pd.to_datetime(master["GAME_DATE"], errors="coerce")
    master["IS_HOME"] = master["MATCHUP"].str.contains(" vs. ").astype(int)
    master = master.sort_values(["GAME_DATE", "GAME_ID"]).reset_index(drop=True)

    out_path = Path(args.out) / args.filename
    await trio.to_thread.run_sync(lambda: master.to_csv(out_path, index=False))
    print(f"\nSaved {len(master):,} rows → {out_path}")
    return master


def add_derived(df: pd.DataFrame) -> pd.DataFrame:
    df["POSS"] = ((df["FGA"] - df["OREB"]) + df["TOV"] + (0.44 * df["FTA"])).replace(
        0, np.nan
    )
    df["OFF_RTG"] = (df["PTS"] / df["POSS"]) * 100
    df["TS_PCT"] = df["PTS"] / (2 * (df["FGA"] + 0.44 * df["FTA"]).replace(0, np.nan))
    df["AST_TO"] = df["AST"] / df["TOV"].replace(0, np.nan)
    df["DEF_PROXY"] = (df["STL"] + df["BLK"]) / df["POSS"]
    df["THREE_RATE"] = df["FG3A"] / df["FGA"].replace(0, np.nan)
    df["FT_RATE"] = df["FTA"] / df["FGA"].replace(0, np.nan)
    return df


def rolling_team_features(df: pd.DataFrame) -> pd.DataFrame:
    df = add_derived(df)
    grp = df.groupby("TEAM_ID")
    available = [c for c in ROLL_COLS if c in df.columns]
    for col in available:
        for w in WINDOWS:
            df[f"last{w}_{col}"] = grp[col].transform(
                lambda x, w=w: x.shift(1).rolling(w, min_periods=2).mean(),
            )
    df["WIN"] = (df["WL"] == "W").astype(int)
    for w in WINDOWS:
        df[f"last{w}_win_pct"] = grp["WIN"].transform(
            lambda x, w=w: x.shift(1).rolling(w, min_periods=2).mean(),
        )
    return df


def schedule_features(df: pd.DataFrame) -> pd.DataFrame:
    grp = df.groupby("TEAM_ID")
    df["days_rest"] = (
        grp["GAME_DATE"]
        .transform(
            lambda x: x.diff().dt.days,
        )
        .fillna(3)
        .clip(0, 14)
    )
    df["is_b2b"] = (df["days_rest"] == 0).astype(int)
    df["is_away"] = 1 - df["IS_HOME"]
    df["road_trip_game_num"] = (
        grp["is_away"].transform(
            lambda x: x.groupby((x != x.shift()).cumsum()).cumcount() + 1,
        )
        * df["is_away"]
    )
    df["games_played_in_season"] = df.groupby(["TEAM_ID", "SEASON"]).cumcount()
    return df


def h2h_features(df: pd.DataFrame) -> pd.DataFrame:
    home = df[df["IS_HOME"] == 1][["GAME_ID", "GAME_DATE", "TEAM_ID", "WIN"]].rename(
        columns={"TEAM_ID": "HOME_TEAM_ID", "WIN": "HOME_WIN"},
    )
    away = df[df["IS_HOME"] == 0][["GAME_ID", "TEAM_ID"]].rename(
        columns={"TEAM_ID": "AWAY_TEAM_ID"},
    )
    wide = (
        home.merge(away, on="GAME_ID").sort_values("GAME_DATE").reset_index(drop=True)
    )
    pair_key = wide[["HOME_TEAM_ID", "AWAY_TEAM_ID"]].apply(
        lambda r: tuple(sorted([r["HOME_TEAM_ID"], r["AWAY_TEAM_ID"]])),
        axis=1,
    )
    h2h_list = []
    for _, grp in wide.groupby(pair_key):
        grp = grp.sort_values("GAME_DATE")
        grp["h2h_home_win_pct"] = (
            grp["HOME_WIN"].shift(1).rolling(3, min_periods=1).mean()
        )
        h2h_list.append(grp[["GAME_ID", "h2h_home_win_pct"]])
    h2h_df = pd.concat(h2h_list).reset_index(drop=True)
    df = df.merge(h2h_df, on="GAME_ID", how="left")
    df["h2h_home_win_pct"] = df["h2h_home_win_pct"].fillna(0.5)
    return df


def pivot_to_games(df: pd.DataFrame) -> pd.DataFrame:
    roll_cols = [c for c in df.columns if c.startswith("last")]
    sched_cols = ["days_rest", "is_b2b", "road_trip_game_num", "games_played_in_season"]
    keep = roll_cols + sched_cols

    home = df[df["IS_HOME"] == 1][
        [
            "GAME_ID",
            "GAME_DATE",
            "TEAM_ID",
            "SEASON",
            "SEASON_TYPE",
            "WIN",
            "h2h_home_win_pct",
            *keep,
        ]
    ].copy()
    home.columns = [
        "GAME_ID",
        "GAME_DATE",
        "HOME_TEAM_ID",
        "SEASON",
        "SEASON_TYPE",
        "HOME_TEAM_WINS",
        "h2h_home_win_pct",
    ] + [f"home_{c}" for c in keep]

    away = df[df["IS_HOME"] == 0][["GAME_ID", "TEAM_ID", *keep]].copy()
    away.columns = ["GAME_ID", "AWAY_TEAM_ID"] + [f"away_{c}" for c in keep]

    out = home.merge(away, on="GAME_ID", how="inner")

    for col in roll_cols:
        if f"home_{col}" in out.columns and f"away_{col}" in out.columns:
            out[f"diff_{col}"] = out[f"home_{col}"] - out[f"away_{col}"]

    out["rest_advantage"] = out["home_days_rest"] - out["away_days_rest"]
    out["season_year"] = out["SEASON"].str[:4].astype(int)
    out["is_playoff"] = (out["SEASON_TYPE"] == "Playoffs").astype(int)
    return out


def engineer_features(
    df: pd.DataFrame, out_dir: str, features_filename: str
) -> pd.DataFrame:
    print("\nEngineering features...")
    df = df.sort_values(["GAME_DATE", "GAME_ID"]).reset_index(drop=True)
    df = rolling_team_features(df)
    df = schedule_features(df)
    df = h2h_features(df)
    df = pivot_to_games(df)
    before = len(df)
    df = df.dropna(subset=["home_last5_win_pct"]).reset_index(drop=True)
    print(f"  Dropped {before - len(df)} cold-start rows")
    out_path = Path(out_dir) / features_filename
    df.to_csv(out_path, index=False)
    print(f"  {len(df):,} rows | {len(df.columns)} features → {out_path}")
    print(f"  Home win rate: {df['HOME_TEAM_WINS'].mean():.3f}")
    return df


async def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--start", type=int, default=2000)
    parser.add_argument("--end", type=int, default=2024)
    parser.add_argument("--delay", type=float, default=1.2)
    parser.add_argument("--out", type=str, default="../data")
    parser.add_argument("--filename", type=str, default="all_games.csv")
    parser.add_argument("--features-filename", type=str, default="features.csv")
    parser.add_argument("--no-playoffs", action="store_true")
    parser.add_argument("--skip-fetch", action="store_true")
    args = parser.parse_args()

    if args.skip_fetch:
        path = Path(args.out) / args.filename
        print(f"Loading {path} ...")
        df = pd.read_csv(path, parse_dates=["GAME_DATE"])
    else:
        df = await fetch_all(args)

    engineer_features(df, args.out, args.features_filename)


trio.run(main)
