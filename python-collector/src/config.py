from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    weather_base_url: str = ""
    latitude: float = 0.0
    longitude: float = 0.0
    timezone: str = "UTC"

    rabbitmq_queue: str = "weather_data_queue"
    rabbitmq_host: str = "localhost"
    rabbitmq_port: int = 5672
    rabbitmq_user: str = "guest"
    rabbitmq_pass: str = "guest"

    class Config:
        env_file = ".env"
        case_sensitive = False
        extra = "ignore"


settings = Settings()
