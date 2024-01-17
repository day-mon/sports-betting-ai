import asyncio

from history.history import HistoryService
from services.missed_games.missed_games import MissedGames
from loguru import logger
class ServiceManager:
    def __init__(self):
        self.services = []

    def add_service(self, service):
        self.services.append(service)

    async def start(self):
        logger.debug(f"Starting {len(self.services)} services")

        tasks = [asyncio.create_task(service.start()) for service in self.services]
        await asyncio.gather(*tasks)


    async def stop(self):
        for service in self.services:
            await service.stop()

    @staticmethod
    def from_services(services):
        manager = ServiceManager()
        for service in services:
            manager.add_service(service)
        return manager

    async def restart(self):
        await self.stop()
        await self.start()

if __name__ == "__main__":
    service_manager = ServiceManager.from_services([HistoryService()])
    asyncio.run(service_manager.start())