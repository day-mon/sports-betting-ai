import pydantic_settings


class Settings(pydantic_settings.BaseSettings):
    model_config = pydantic_settings.SettingsConfigDict(
        env_prefix="AB_",
        env_nested_delimiter="__",
        case_sensitive=False,
    )


settings = Settings()
