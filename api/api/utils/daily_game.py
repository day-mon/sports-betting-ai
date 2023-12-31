from typing import Any

from api.business.daily_games import DailyGame


def get_cache_key(games: list[DailyGame], model_name: str) -> str:
    game_date = games[0].game_date
    game_ids = [game.game_id for game in games]

    game_key = ''.join(sorted(set(
        ''.join(game_id for game_id in game_ids)
    )))
    return f"{model_name}:{game_key}:{game_date}"
