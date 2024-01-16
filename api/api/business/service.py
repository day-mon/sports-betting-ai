from abc import abstractmethod
from multiprocessing import Event

from api.main import BASE_PATH
import httpx
import os


class Service:
    client: httpx.AsyncClient

    def __init__(self):
        host = os.getenv("API_HOST", "http://localhost:8000")
        if host.endswith("/"):
            host = host[:-1]

        self.client = httpx.AsyncClient(base_url=f"{host}{BASE_PATH}", timeout=60)

    @abstractmethod
    async def start(self):
        raise NotImplementedError
