from dataclasses import dataclass


@dataclass
class CurrentWeatherDTO:
    time: str
    interval: int
    temperature_2m: float
    is_day: int
    relative_humidity_2m: int
    apparent_temperature: float
    weather_code: int
    precipitation: float
    wind_speed_10m: float
    wind_direction_10m: int
    wind_gusts_10m: float


@dataclass
class CurrentWeatherResponseDTO:
    latitude: float
    longitude: float
    current: CurrentWeatherDTO
