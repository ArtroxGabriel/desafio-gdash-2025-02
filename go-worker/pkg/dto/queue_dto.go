// Package dto represents Data Transfer Objects used in the application.
package dto

type CurrentWeatherResponseDTO struct {
	Latitude  *float64           `json:"latitude"`
	Longitude *float64           `json:"longitude"`
	Current   *CurrentWeatherDTO `json:"current"`
}

type CurrentWeatherDTO struct {
	Time                *string  `json:"time"`
	Interval            *int     `json:"interval"`
	Temperature2m       *float64 `json:"temperature_2m"`
	IsDay               *int8    `json:"is_day"`
	RelativeHumidity2m  *int     `json:"relative_humidity_2m"`
	ApparentTemperature *float64 `json:"apparent_temperature"`
	WeatherCode         *int     `json:"weather_code"`
	Precipitation       *float64 `json:"precipitation"`
	WindSpeed10m        *float64 `json:"wind_speed_10m"`
	WindDirection10m    *int     `json:"wind_direction_10m"`
	WindGusts10m        *float64 `json:"wind_gusts_10m"`
}
