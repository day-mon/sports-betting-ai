import asyncio
from loguru import logger
from api.business.service import Service


class MissedGames(Service):

    async def start(self):
        while True:
            dates = await self.client.get('model/history/dates')
            dates.raise_for_status()
            dates_json = dates.json()

            logger.info(f"Found {len(dates_json)} dates with {dates_json} games")
            await asyncio.sleep(9999)
