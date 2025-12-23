from pydantic import Field, SecretStr, AnyHttpUrl
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    weather_base_url: str = Field(..., description="Base URL for the weather service")

    latitude: float = Field(..., ge=-90, le=90)
    longitude: float = Field(..., ge=-180, le=180)
    timezone: str = "UTC"

    rabbitmq_queue: str = "weather_data_queue"
    rabbitmq_host: str = "localhost"
    rabbitmq_port: int = Field(5672, gt=0, lt=65536)
    rabbitmq_user: str = "guest"

    rabbitmq_pass: str = Field(..., alias="RABBITMQ_PASS")

    model_config = SettingsConfigDict(
        env_file=".env", env_file_encoding="utf-8", case_sensitive=False, extra="ignore"
    )


settings = Settings()  # pyright: ignore [reportCallIssue]
