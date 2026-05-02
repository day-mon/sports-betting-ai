"""Pydantic models for Rotowire API responses."""

from __future__ import annotations

import pydantic


class InjuryItem(pydantic.BaseModel):
    player: str
    team: str
    position: str
    injury: str
    status: str
