import structlog
from typing import List

import httpx
from dacite import from_dict

from config import settings
from dtos.current_weather_dto import CurrentWeatherResponseDTO

logger = structlog.get_logger()


class WeatherAPIClient:
    def __init__(self):
        self.base_url = settings.weather_base_url
        self.latitude = settings.latitude
        self.longitude = settings.longitude
        self.timezone = settings.timezone

    def get_current_weather(self) -> CurrentWeatherResponseDTO | None:
        logger.info("Fetching current weather data from API")

        variables: List[str] = [
            "temperature_2m",
            "is_day",
            "relative_humidity_2m",
            "apparent_temperature",
            "weather_code",
            "precipitation",
            "wind_speed_10m",
            "wind_direction_10m",
            "wind_gusts_10m",
        ]

        params = {
            "latitude": self.latitude,
            "longitude": self.longitude,
            "timezone": self.timezone,
            "forecast_days": 1,
            "current": ",".join(variables),
        }

        r = httpx.get(self.base_url, params=params)

        logger.debug("API Response", status_code=r.status_code, response=r.text)
        try:
            current_weather_dto = from_dict(
                data_class=CurrentWeatherResponseDTO, data=r.json()
            )

            logger.info("Successfully converted API response to DTO")
            logger.debug("Current weather DTO", dto=current_weather_dto)
            return current_weather_dto
        except Exception as e:
            logger.error("Error converting API response to DTO", error=e)
            return None
