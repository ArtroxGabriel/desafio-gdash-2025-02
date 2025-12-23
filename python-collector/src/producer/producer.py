from api_client.api import WeatherAPIClient
import json
import time
from dataclasses import asdict

import pika
import structlog
from pika.exceptions import AMQPConnectionError

from config import settings
from dtos.current_weather_dto import CurrentWeatherResponseDTO

logger = structlog.get_logger()


class RabbitMQProducer:
    def __init__(self, collector: WeatherAPIClient) -> None:
        self.collector = collector

    def execute(self) -> None:
        weather_data = self.collector.get_current_weather()
        if weather_data is None:
            logger.error("No weather data retrieved; skipping enqueue.")
            return

        self.enqueue_weather_data(weather_data)

    def enqueue_weather_data(
        self, data: CurrentWeatherResponseDTO, retries: int = 3
    ) -> None:
        message_body = json.dumps(asdict(data))

        for attempt in range(retries):
            try:
                parameters = pika.ConnectionParameters(
                    host=settings.rabbitmq_host,
                    port=settings.rabbitmq_port,
                    credentials=pika.PlainCredentials(
                        settings.rabbitmq_user, settings.rabbitmq_pass
                    ),
                )

                with pika.BlockingConnection(parameters) as connection:
                    channel = connection.channel()

                    channel.queue_declare(queue=settings.rabbitmq_queue, durable=True)

                    channel.basic_publish(
                        exchange="",
                        routing_key=settings.rabbitmq_queue,
                        body=message_body,
                        properties=pika.BasicProperties(
                            delivery_mode=2,
                            content_type="application/json",
                        ),
                    )
                    logger.info("Successfully enqueued weather data.")
                    return
            except AMQPConnectionError as e:
                logger.warning(f"Connection attempt {attempt + 1} failed", error=e)
                if attempt < retries - 1:
                    time.sleep(2**attempt)
                else:
                    logger.error("Max retries reached. Could not connect to RabbitMQ.")
                    raise
