from apscheduler.schedulers.asyncio import AsyncIOScheduler

from app.services.notification_service import check_reminders

scheduler = AsyncIOScheduler()


async def start_scheduler() -> None:
    scheduler.add_job(
        check_reminders,
        trigger="interval",
        minutes=5,
        id="check_reminders",
        replace_existing=True,
    )
    scheduler.start()


async def stop_scheduler() -> None:
    scheduler.shutdown(wait=False)
