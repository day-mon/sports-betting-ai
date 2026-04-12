from typing import TYPE_CHECKING, cast

import trio
from accuribet_service.app import app
from accuribet_service.config.app import settings
from hypercorn.config import Config
from hypercorn.trio import serve

if TYPE_CHECKING:
    from hypercorn.typing import Framework


def main() -> None:
    config = Config()
    config.bind = [f"{settings.host}:{settings.port}"]
    config.use_reloader = settings.reload
    trio.run(serve, cast("Framework", app), config)


if __name__ == "__main__":
    main()
