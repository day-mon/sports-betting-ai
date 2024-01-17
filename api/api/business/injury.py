from abc import ABC, abstractmethod

import httpx
from pydantic import BaseModel

from api import constants
from api.business.factory import AbstractFactory, FactoryItem
from api.model.games.injury import InjuryItem, Injuries


class PlayerInjurySource(ABC):
    source_url: str

    def __init__(self, source_url: str):
        self.source_url = source_url
    @abstractmethod
    async def fetch(self) -> list[InjuryItem]:
        pass


class RotowireInjurySource(PlayerInjurySource):
    def __init__(self):
        super().__init__(
            "https://www.rotowire.com/basketball/tables/injury-report.php?team=ALL&pos=ALL"
        )

    async def fetch(self) -> list[InjuryItem]:
        async with httpx.AsyncClient(timeout=60) as client:
            response = await client.get(self.source_url)

        response.raise_for_status()

        injuries = Injuries.model_validate(response.json())
        return injuries.root


class PlayerInjuryFactory(AbstractFactory):
    _values: dict[str, FactoryItem] = {
        "rotowire": FactoryItem(
            name="rotowire",
            factory_item=RotowireInjurySource,
        ),
    }
