import uvicorn

from accuribet_service.app import app
from accuribet_service.config.app import settings


def main() -> None:
    uvicorn.run(
        app,
        host=settings.host,
        port=settings.port,
        reload=settings.reload,
    )


if __name__ == "__main__":
    main()
