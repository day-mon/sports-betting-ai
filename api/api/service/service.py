import asyncio
from abc import ABC, abstractmethod
from threading import Timer, Thread


class BackgroundService(ABC):
    """
    Abstract class for background services

    Attributes:
        name (str): Name of the service
        description (str): Description of the service
    """
    name: str
    description: str

    def __init__(self, name: str, description: str):
        self.name = name
        self.description = description

    def start(self):
        """
        Starts the service
        """
        self.run()

    @abstractmethod
    async def run(self, **kwargs):
        pass


class TimeBasedBackgroundService(BackgroundService):
    """
    Abstract class for time based background services

    Attributes:
        name (str): Name of the service
        description (str): Description of the service
        interval (int): Interval in seconds to run the service
    """
    interval: int

    def __init__(self, name: str, description: str, interval: int):
        super().__init__(name, description)
        self.interval = interval

    def start(self):
        """
        Starts the service
        """
        self.run()
        Timer(self.interval, self.start).start()

    @abstractmethod
    def run(self):
        """
        Runs the service
        """
        pass




class ServiceManager(ABC):
    services: list[BackgroundService]

    def __init__(self, services: list[BackgroundService]):
        self.services = services

    def start(self):
        """
        Starts a service and use asyncio to run it in the background
        """
        tasks = []
        for service in self.services:
            tasks.append(asyncio.create_task(service.run()))
        asyncio.gather(*tasks)
