from abc import abstractmethod
from multiprocessing import Event


class Service:
    @abstractmethod
    async def start(self):
        raise NotImplementedError




