# hourly
# https://api.open-meteo.com/v1/forecast?latitude=-3.7172&longitude=-38.5431&current=temperature_2m,is_day,relative_humidity_2m,apparent_temperature,weather_code,precipitation,wind_speed_10m,wind_direction_10m,wind_gusts_10m&timezone=America%2FSao_Paulo&forecast_days=1

# daily
# https://api.open-meteo.com/v1/forecast?latitude=-3.7172&longitude=-38.5431&daily=uv_index_max,weather_code,apparent_temperature_max,apparent_temperature_min,precipitation_sum&timezone=America%2FSao_Paulo&forecast_days=1
from cron_job.cron_job import cron_job
from apscheduler.schedulers.blocking import BlockingScheduler


def main():
    # Setting up the scheduler to run your weather collection logic
    scheduler = BlockingScheduler()
    cron_job(scheduler)

    try:
        scheduler.start()
    except (KeyboardInterrupt, SystemExit):
        pass


if __name__ == "__main__":
    main()
