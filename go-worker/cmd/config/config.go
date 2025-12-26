// Package config represents configuration settings for the application
package config

type Config struct {
	APIURL   string          `env:"API_URL,required"`
	APIKEY   string          `env:"API_URL,required"`
	Rabbitmq *RabbitmqConfig `env:",prefix=RABBITMQ_"`
}

type RabbitmqConfig struct {
	Username string `env:"USER,required"`
	Password string `env:"PASS,required"`
	Host     string `env:"HOST,required"`
	Queue    string `env:"QUEUE,default=weather_data_queue"`
	Port     string `env:"PORT,default=5672"`
}
