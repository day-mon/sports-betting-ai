import signal
import time

from loguru import logger

from services.history.history import HistoryService
from services.manager import ServiceManager


def signal_handler(manager, signum, frame):
    print(f"Received signal {signum}, stopping services...")
    manager.stop()
    logger.info("Services stopped") 
    exit(0)


def main():
    manager = ServiceManager.from_services(
        [
            HistoryService(),
        ]
    )

    manager.start()
    # Register signal handlers
    signal.signal(signal.SIGINT, lambda signum, frame: signal_handler(manager, signum, frame))
    signal.signal(signal.SIGTERM, lambda signum, frame: signal_handler(manager, signum, frame))
    logger.info("Services started")

    try:
        while True:
            time.sleep(1)
    except SystemExit:
        pass


if __name__ == "__main__":
    main()
