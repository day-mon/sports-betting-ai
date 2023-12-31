import csv
import os
import uuid
from abc import ABC, abstractmethod
from typing import Literal, Optional, Union

import httpx
import numpy
import numpy as np
import pandas as pd
import tensorflow as tf
from loguru import logger
from pandas import DataFrame
from pydantic import BaseModel

from api.business.daily_games import DailyGame
from api.business.factory import AbstractFactory
from api.config.application import get_settings
from api.model.model.model import TeamStats


class Prediction(BaseModel):
    prediction_type: Literal["win-loss", "total-score"]
    prediction: Union[str, int, float]
    game_id: str
    confidence: Optional[float] = None


class PredictionModel(ABC):
    model_name: str
    model_dir: str
    columns_to_drop: list[str]
    stats_source: Optional[str] = None

    def __init__(self, model_name: str, columns_to_drop: list[str], model_dir: str, stats_source: Optional[str] = None):
        self.stats_source = stats_source
        self.model_name = model_name
        self.model_dir = model_dir
        self.columns_to_drop = columns_to_drop

    @abstractmethod
    def predict(self, data: DataFrame) -> list[Prediction]:
        pass

    @abstractmethod
    def fetch_stats(self, **kwargs) -> DataFrame:
        pass


class TFPredictionModel(PredictionModel):
    _data_dir: str
    prediction_type: Literal["win-loss", "total-score"] = "win-loss"
    client: httpx.Client
    model: tf.keras.models.Model

    def __init__(
            self,
            model_name: str,
            columns_to_drop: list[str],
            model_dir: str,
            prediction_type: Literal["win-loss", "total-score"] = "win-loss"
        ):
        settings = get_settings()
        super().__init__(model_name, columns_to_drop=columns_to_drop, model_dir=model_dir,
                         stats_source=settings.CF_WORKER_URL)
        self._data_dir = settings.DATA_DIR
        self.prediction_type = prediction_type
        self.model = tf.keras.models.load_model(f"{self.model_dir}/{self.model_name}")
        self.client = httpx.Client()

    def predict(self, data: DataFrame) -> list[Prediction]:
        logger.debug(f"Predicting with data: {data.shape}")
        di = {index: {"home_team": row["TEAM_NAME"], "away_team": row["TEAM_NAME.1"]} for index, row in data.iterrows()}
        filtered_data = data.drop(self.columns_to_drop, axis=1, errors="ignore")
        predictions_raw = self.model.predict(filtered_data)
        logger.debug(f"Raw Predictions: {predictions_raw}")
        predictions = np.argmax(predictions_raw, axis=1)
        logger.debug(f"Args Max Predictions: {predictions}")
        confidences = np.max(predictions_raw, axis=1)
        logger.debug(f"Confidences: {confidences}")

        predicts: list[Prediction] = []
        for index, (prediction, confidence) in enumerate(zip(predictions, confidences)):
            predicts.append(
                Prediction(
                    prediction_type=self.prediction_type,
                    prediction=di[index]["home_team"] if prediction == 0 else di[index]["away_team"],
                    game_id=str(uuid.uuid4()),
                    confidence=confidence
                )
            )
        return predicts

    def fetch_stats(self, **kwargs) -> DataFrame:
        daily_games: list[DailyGame] = kwargs["daily_games"]
        date = daily_games[0].game_date

        if os.path.exists(f"{self._data_dir}/{date}.csv"):
            logger.debug(f"Using cached data for {date}")
            return pd.read_csv(f"{self._data_dir}/{date}.csv")

        logger.debug(f"Fetching data for {date}")
        daily_stats = self.client.get(self.stats_source)
        daily_stats.raise_for_status()

        logger.debug(f"Writing data for {date} with {daily_stats.json()}")
        team_stats = TeamStats.model_validate(daily_stats.json())
        stats = self._write_stats_to_csv(team_stats, daily_games, date)
        logger.debug(f"Stats: {stats}")
        return stats

    def _write_stats_to_csv(self, response: TeamStats, matches: list[DailyGame], date: str) -> DataFrame:
        result_set_name = "LeagueDashTeamStats"
        csv_str = ""
        correct_result_set = next(
            (result_set for result_set in response.resultSets if result_set.name == result_set_name), None)
        logger.debug(f"Correct Result Set: {correct_result_set}")
        if not correct_result_set:
            logger.error(f"Unable to find result set: {result_set_name}")
            return pd.DataFrame()

        for i in range(2):
            if i == 1:
                csv_str += ","
            csv_str += ",".join(correct_result_set.headers)
        csv_str += "\n"
        for match in matches:
            home_team = correct_result_set.get_team_stats(match.home_team.id)[0]
            away_team = correct_result_set.get_team_stats(match.away_team.id)[0]
            csv_str += ",".join([str(val) for val in home_team + away_team])
            csv_str += "\n"

        os.makedirs(self._data_dir, exist_ok=True)
        with open(os.path.join(self._data_dir, f"{date}.csv"), "w", newline="") as f:
            f.write(csv_str)

        return pd.read_csv(os.path.join(self._data_dir, f"{date}.csv"))


class LLMBasedPredictionModel(PredictionModel):
    def predict(self, data: DataFrame) -> list[Prediction]:
        pass

    def fetch_stats(self, **kwargs) -> DataFrame:
        pass


class FortyTwoDPModel(TFPredictionModel):
    def __init__(self, model_name: str, model_dir: str):
        columns = [
            "TEAM_NAME", "TEAM_ID", "GP",
            "GP_RANK", "CFID", "MIN", "CFPARAMS", "W", "L", "PLUS_MINUS",
            "PLUS_MINUS_RANK", "W_RANK", "L_RANK", "MIN_RANK"
        ]

        columns = columns + [f"{column}.1" for column in columns]
        super().__init__(model_name, columns_to_drop=columns, model_dir=model_dir)


class FortyEightDPModel(TFPredictionModel):
    def __init__(self, model_name: str, model_dir: str):
        columns = [
            "TEAM_NAME",
            "TEAM_ID",
            "GP",
            "GP_RANK",
            "CFID",
            "MIN",
            "CFPARAMS",
        ]
        columns = columns + [f"{column}.1" for column in columns]
        super().__init__(model_name, columns_to_drop=columns, model_dir=model_dir)

class OUPredictionModel(FortyEightDPModel):
    def __init__(self, model_name: str, model_dir: str):
        super().__init__(model_name, model_dir)
        self.prediction_type = "total-score"

    def predict(self, data: DataFrame) -> list[Prediction]:
        logger.debug(f"Predicting with data: {data.shape}")
        filtered_data = data.drop(self.columns_to_drop, axis=1, errors="ignore")
        predictions_raw: numpy.ndarray = self.model.predict(filtered_data)
        logger.debug(f"Raw Predictions: {predictions_raw}")
        predictions = predictions_raw.flatten().tolist()
        predicts: list[Prediction] = []
        for prediction in predictions:
            predicts.append(
                Prediction(
                    prediction_type=self.prediction_type,
                    prediction=prediction,
                    game_id=str(uuid.uuid4()),
                )
            )
        return predicts


class PredictionModelFactory(AbstractFactory):
    _values = {
        "v2": FortyTwoDPModel,
        "v1": FortyEightDPModel,
        "ou": OUPredictionModel
    }
