import asyncio
import time

from api.business.model import PredictionModelFactory
from api.config.application import get_settings
from api.routes.games import games
from api.routes.model import predict
from api.service.service import TimeBasedBackgroundService


class History(TimeBasedBackgroundService):
    def __init__(self):
        super().__init__(
            name="history",
            description="Gets the history of games and predicts the outcome",
            interval=60 * 60 * 24,
        )

    async def run(self, **kwargs):
        print("Running History")
        await asyncio.sleep(5)
        daily_games = await games(
            settings=get_settings(),
        )
        while True:
            add = 5 + 5
            print(add)

            time.sleep(99999)

        # if len(daily_games) == 0:
        #     print("No games found")
        #     return
        #
        # if not all(game.is_finished() for game in daily_games):
        #     print("All games are final, exiting")
        #     return
        #
        # models = PredictionModelFactory.keys()
        # for model_name in models:
        #     print(f"Predicting with {model_name}")
        #     predictions = await predict(model_name)
        #     print(predictions)
        #
