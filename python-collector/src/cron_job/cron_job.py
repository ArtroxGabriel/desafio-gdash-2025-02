from producer.producer import RabbitMQProducer
import structlog
from apscheduler.schedulers.blocking import BlockingScheduler

from api_client.api import WeatherAPIClient

logger = structlog.get_logger()


def configure_cron_job(scheduler: BlockingScheduler) -> None:
    logger.info("Setting up cron jobs...")
    collector = WeatherAPIClient()
    producer = RabbitMQProducer(collector)

    scheduler.add_job(
        producer.execute, "interval", seconds=4, id="hourly-weather-collector"
    )

    logger.info("Cron jobs set up successfully.")
