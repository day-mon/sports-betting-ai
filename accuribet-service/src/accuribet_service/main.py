import trio
from hypercorn.config import Config
from hypercorn.trio import serve

from accuribet_service.app import app
from accuribet_service.config.base import settings


def main() -> None:
    config = Config()
    config.bind = [f"{settings.host}:{settings.port}"]
    trio.run(serve, app, config)


if __name__ == "__main__":
    main()
