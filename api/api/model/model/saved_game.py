from typing import Optional

from pydantic import BaseModel, ConfigDict, field_validator, ValidationInfo, computed_field

from api.business.database import Database


class SavedGame(BaseModel):
    game_id: str
    date: str
    home_team_name: str
    home_team_score: int
    away_team_name: str
    away_team_score: int
    model_name: str
    prediction: str | int

    @computed_field
    @property
    def prediction_was_correct(self) -> Optional[bool]:
        if self.model_name == "ou":
            return None

        winner = self.home_team_name if self.home_team_score > self.away_team_score else self.away_team_name
        return winner == self.prediction

    @classmethod
    def check_prediction(cls, value, values: ValidationInfo):
        if values.data.get("model_name") == "ou":
            return int(value)

        return value

    model_config = ConfigDict(protected_namespaces=(), extra="allow")

    @staticmethod
    async def from_db(
            db: Database,
            date: str,
            model_name: str
    ) -> list["SavedGame"]:
        query = f"""
        SELECT * FROM saved_games
        WHERE date = $1
        AND model_name = $2"""
        response = await db.query(query, values=[date, model_name])
        return [SavedGame(**game) for game in response]
