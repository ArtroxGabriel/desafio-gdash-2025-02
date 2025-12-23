import structlog
from apscheduler.schedulers.blocking import BlockingScheduler

from cron_job.cron_job import configure_cron_job
from logger.logger import configure_log

configure_log()

logger = structlog.get_logger()


def main():
    scheduler = BlockingScheduler()
    configure_cron_job(scheduler)

    try:
        logger.info("Starting scheduler...")
        scheduler.start()
    except (KeyboardInterrupt, SystemExit):
        logger.info("Shutting down scheduler...")
        pass


if __name__ == "__main__":
    main()
