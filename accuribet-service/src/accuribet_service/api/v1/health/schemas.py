import pydantic


class HealthResponse(pydantic.BaseModel):
    status: str
    version: str
