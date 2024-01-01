from __future__ import annotations

from typing import List

from pydantic import BaseModel, RootModel
from pydantic_settings import SettingsConfigDict


class InjuryItem(BaseModel):
    player: str
    team: str
    position: str
    injury: str
    status: str

    model_config = SettingsConfigDict(extra="ignore")


class Injuries(RootModel):
    root: List[InjuryItem]
