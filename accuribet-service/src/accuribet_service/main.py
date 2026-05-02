import uvicorn

from accuribet_service.config.app import settings


def main() -> None:
    uvicorn.run(
        "accuribet_service.app:app",
        host=settings.host,
        port=settings.port,
        reload=settings.reload,
    )


if __name__ == "__main__":
    main()
