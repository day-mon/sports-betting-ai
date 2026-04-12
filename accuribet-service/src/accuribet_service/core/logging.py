from __future__ import annotations

import logging
import typing

import structlog
from asgi_correlation_id import correlation_id


def _add_correlation_id(
    logger: object,
    method: str,
    event_dict: structlog.types.EventDict,
) -> structlog.types.EventDict:
    event_dict["correlation_id"] = correlation_id.get() or "-"
    return event_dict


_SHARED_PROCESSORS: list[structlog.types.Processor] = [
    structlog.contextvars.merge_contextvars,
    _add_correlation_id,
    structlog.stdlib.add_logger_name,
    structlog.stdlib.add_log_level,
    structlog.processors.TimeStamper(fmt="iso"),
    structlog.processors.StackInfoRenderer(),
]


def configure_logging(
    json_logs: bool = False,
    log_level: typing.Literal["DEBUG", "INFO", "WARNING", "ERROR", "CRITICAL"] = "INFO",
) -> None:
    structlog.configure(
        processors=[
            *_SHARED_PROCESSORS,
            structlog.stdlib.ProcessorFormatter.wrap_for_formatter,
        ],
        logger_factory=structlog.stdlib.LoggerFactory(),
        wrapper_class=structlog.stdlib.BoundLogger,
        cache_logger_on_first_use=True,
    )

    renderer: structlog.types.Processor = (
        structlog.processors.JSONRenderer()
        if json_logs
        else structlog.dev.ConsoleRenderer()
    )

    formatter = structlog.stdlib.ProcessorFormatter(
        processors=[
            structlog.stdlib.ProcessorFormatter.remove_processors_meta,
            renderer,
        ],
        foreign_pre_chain=_SHARED_PROCESSORS,
    )

    handler = logging.StreamHandler()
    handler.setFormatter(formatter)

    root = logging.getLogger()
    root.handlers.clear()
    root.addHandler(handler)
    root.setLevel(log_level)

    logging.getLogger("hypercorn.access").setLevel(logging.WARNING)
    logging.getLogger("hypercorn.error").setLevel(logging.INFO)
    logging.getLogger("sqlalchemy.engine").setLevel(logging.WARNING)
