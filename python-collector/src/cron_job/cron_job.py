from datetime import datetime
from apscheduler.schedulers.blocking import BlockingScheduler


def tick_3():
    print(f"Tick 3! The time is: {datetime.now()}")


def tick_1():
    print(f"Tick 1! The time is: {datetime.now()}")


def cron_job(scheduler: BlockingScheduler) -> None:
    scheduler.add_job(tick_3, "interval", seconds=3)

    scheduler.add_job(tick_1, "interval", seconds=1)

    try:
        scheduler.start()
    except (KeyboardInterrupt, SystemExit):
        pass
