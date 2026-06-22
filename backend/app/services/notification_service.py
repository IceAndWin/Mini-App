from datetime import date, datetime, time, timedelta

from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.database import async_session
from app.models.booking import Booking
from app.models.user import User
from app.utils.telegram_bot import send_message


async def _send_booking_notification(booking: Booking, text: str) -> bool:
    if not booking.user_id:
        return False
    async with async_session() as db:
        user = await db.get(User, booking.user_id)
        if not user or not user.telegram_id:
            return False
        return await send_message(user.telegram_id, text)


async def notify_booking_confirmed(booking_id: str) -> bool:
    async with async_session() as db:
        result = await db.execute(
            select(Booking)
            .where(Booking.id == booking_id)
            .options(selectinload(Booking.master), selectinload(Booking.service))
        )
        booking = result.scalar_one_or_none()
        if not booking:
            return False

        text = (
            f"✅ <b>Запись подтверждена!</b>\n\n"
            f"<b>Услуга:</b> {booking.service.name}\n"
            f"<b>Мастер:</b> {booking.master.name}\n"
            f"<b>Дата:</b> {booking.date.strftime('%d.%m.%Y')}\n"
            f"<b>Время:</b> {booking.time.strftime('%H:%M')}\n"
            f"<b>Статус:</b> {booking.status}\n\n"
            f"Спасибо, что выбрали нас!"
        )
        return await _send_booking_notification(booking, text)


async def notify_24h_reminder(booking_id: str) -> bool:
    async with async_session() as db:
        result = await db.execute(
            select(Booking)
            .where(Booking.id == booking_id, Booking.status.in_(["pending", "confirmed"]))
            .options(selectinload(Booking.master), selectinload(Booking.service))
        )
        booking = result.scalar_one_or_none()
        if not booking:
            return False

        text = (
            f"⏰ <b>Напоминание: запись через 24 часа</b>\n\n"
            f"<b>Услуга:</b> {booking.service.name}\n"
            f"<b>Мастер:</b> {booking.master.name}\n"
            f"<b>Дата:</b> {booking.date.strftime('%d.%m.%Y')}\n"
            f"<b>Время:</b> {booking.time.strftime('%H:%M')}\n\n"
            f"Ждём вас!"
        )
        return await _send_booking_notification(booking, text)


async def notify_2h_reminder(booking_id: str) -> bool:
    async with async_session() as db:
        result = await db.execute(
            select(Booking)
            .where(Booking.id == booking_id, Booking.status.in_(["pending", "confirmed"]))
            .options(selectinload(Booking.master), selectinload(Booking.service))
        )
        booking = result.scalar_one_or_none()
        if not booking:
            return False

        text = (
            f"🔔 <b>Напоминание: запись через 2 часа</b>\n\n"
            f"<b>Услуга:</b> {booking.service.name}\n"
            f"<b>Мастер:</b> {booking.master.name}\n"
            f"<b>Дата:</b> {booking.date.strftime('%d.%m.%Y')}\n"
            f"<b>Время:</b> {booking.time.strftime('%H:%M')}\n\n"
            f"Скоро увидимся!"
        )
        return await _send_booking_notification(booking, text)


async def check_reminders() -> None:
    now = datetime.now()
    now_plus_24h = now + timedelta(hours=24)
    now_plus_2h = now + timedelta(hours=2)

    async with async_session() as db:
        stmt = (
            select(Booking)
            .where(Booking.status.in_(["pending", "confirmed"]))
            .options(selectinload(Booking.master), selectinload(Booking.service))
        )
        result = await db.execute(stmt)
        bookings = result.scalars().all()

    for booking in bookings:
        visit_dt = datetime.combine(booking.date, booking.time)

        if not booking.notified_24h and visit_dt <= now_plus_24h:
            success = await notify_24h_reminder(str(booking.id))
            if success:
                async with async_session() as db:
                    b = await db.get(Booking, booking.id)
                    if b:
                        b.notified_24h = True
                        await db.commit()

        if not booking.notified_2h and visit_dt <= now_plus_2h:
            success = await notify_2h_reminder(str(booking.id))
            if success:
                async with async_session() as db:
                    b = await db.get(Booking, booking.id)
                    if b:
                        b.notified_2h = True
                        await db.commit()
