from abc import abstractmethod
from multiprocessing import Event


class Service:
    @abstractmethod
    def start(self, stop_event: Event):
        raise NotImplementedError




