from datetime import date, datetime, time, timedelta

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.api.deps import get_current_user, get_current_user_optional
from app.database import get_db
from app.models.booking import Booking
from app.models.master import Master
from app.models.master_schedule import MasterSchedule
from app.models.promo_code import PromoCode
from app.models.service import Service
from app.models.user import User
from app.schemas.booking import (
    AvailableSlot,
    AvailableSlotsResponse,
    BookingCancelResponse,
    BookingCreate,
    BookingDetailResponse,
    BookingRescheduleRequest,
    BookingResponse,
)
from app.schemas.master import MasterListItem
from app.schemas.service import ServiceResponse

router = APIRouter(prefix="/api/bookings", tags=["bookings"])


def _generate_slots(start: str, end: str, step_minutes: int, booked: set[str]) -> list[AvailableSlot]:
    slots: list[AvailableSlot] = []
    start_h, start_m = start.split(":")
    end_h, end_m = end.split(":")
    current = datetime(2000, 1, 1, int(start_h), int(start_m))
    end_dt = datetime(2000, 1, 1, int(end_h), int(end_m))

    while current + timedelta(minutes=step_minutes) <= end_dt:
        time_str = current.strftime("%H:%M")
        slots.append(AvailableSlot(time=time_str, available=time_str not in booked))
        current += timedelta(minutes=step_minutes)

    return slots


@router.get("/available-slots", response_model=AvailableSlotsResponse)
async def get_available_slots(
    master_id: str = Query(...),
    date_str: str = Query(..., alias="date"),
    service_id: str | None = Query(None),
    db: AsyncSession = Depends(get_db),
):
    try:
        booking_date = date.fromisoformat(date_str)
    except ValueError:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid date format")

    master = await db.get(Master, master_id)
    if not master:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Master not found")

    day_of_week = booking_date.weekday()
    schedule_stmt = select(MasterSchedule).where(
        MasterSchedule.master_id == master_id,
        MasterSchedule.day_of_week == day_of_week,
        MasterSchedule.is_active.is_(True),
    )
    result = await db.execute(schedule_stmt)
    schedule = result.scalar_one_or_none()

    if not schedule:
        return AvailableSlotsResponse(date=date_str, master_id=master_id, slots=[])

    step = 30
    if service_id:
        service = await db.get(Service, service_id)
        if service:
            step = service.duration

    bookings_stmt = select(Booking).where(
        Booking.master_id == master_id,
        Booking.date == booking_date,
        Booking.status.in_(["pending", "confirmed"]),
    )
    result = await db.execute(bookings_stmt)
    existing = result.scalars().all()

    booked_times: set[str] = set()
    for b in existing:
        booked_times.add(b.time.strftime("%H:%M"))

    slots = _generate_slots(schedule.start_time, schedule.end_time, step, booked_times)

    return AvailableSlotsResponse(date=date_str, master_id=master_id, slots=slots)


@router.post("", response_model=BookingResponse, status_code=status.HTTP_201_CREATED)
async def create_booking(
    body: BookingCreate,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
    current_user: User | None = Depends(get_current_user_optional),
):
    master = await db.get(Master, body.master_id)
    if not master:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Master not found")

    service = await db.get(Service, body.service_id)
    if not service:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Service not found")

    day_of_week = body.date.weekday()
    schedule_stmt = select(MasterSchedule).where(
        MasterSchedule.master_id == body.master_id,
        MasterSchedule.day_of_week == day_of_week,
        MasterSchedule.is_active.is_(True),
    )
    result = await db.execute(schedule_stmt)
    schedule = result.scalar_one_or_none()
    if not schedule:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Master does not work on this day",
        )

    request_start = datetime.combine(body.date, body.time)
    request_end = request_start + timedelta(minutes=service.duration)

    if request_start.time() < datetime.strptime(schedule.start_time, "%H:%M").time():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Booking time is before working hours",
        )
    if request_end.time() > datetime.strptime(schedule.end_time, "%H:%M").time():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Booking end time exceeds working hours",
        )

    overlap_stmt = select(Booking).where(
        Booking.master_id == body.master_id,
        Booking.date == body.date,
        Booking.status.in_(["pending", "confirmed"]),
    )
    result = await db.execute(overlap_stmt)
    existing_bookings = result.scalars().all()

    for b in existing_bookings:
        b_service = await db.get(Service, b.service_id)
        b_duration = b_service.duration if b_service else 30
        b_start = datetime.combine(body.date, b.time)
        b_end = b_start + timedelta(minutes=b_duration)

        if request_start < b_end and request_end > b_start:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="This time slot is already booked",
            )

    if body.promo_code:
        result = await db.execute(
            select(PromoCode).where(PromoCode.code == body.promo_code.upper().strip())
        )
        promo = result.scalar_one_or_none()
        if not promo or not promo.is_active or promo.used_count >= promo.max_uses:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Промокод недействителен",
            )
        discount = service.price * promo.discount_percent // 100
        promo.used_count += 1
    else:
        discount = 0

    booking = Booking(
        master_id=body.master_id,
        service_id=body.service_id,
        date=body.date,
        time=body.time,
        client_name=body.client_name,
        client_phone=body.client_phone,
        promo_code=body.promo_code,
        discount_amount=discount,
        user_id=current_user.id if current_user else None,
        status="pending",
    )
    db.add(booking)
    await db.commit()
    await db.refresh(booking)

    from app.services.notification_service import notify_booking_confirmed
    background_tasks.add_task(notify_booking_confirmed, str(booking.id))

    return booking


@router.get("/my", response_model=list[BookingDetailResponse])
async def get_my_bookings(
    current_user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    stmt = (
        select(Booking)
        .where(Booking.user_id == current_user.id)
        .options(selectinload(Booking.master), selectinload(Booking.service))
        .order_by(Booking.date.desc(), Booking.time.desc())
    )
    result = await db.execute(stmt)
    bookings = result.scalars().all()

    return [
        BookingDetailResponse(
            id=str(b.id),
            master_id=str(b.master_id),
            service_id=str(b.service_id),
            date=b.date,
            time=b.time,
            promo_code=b.promo_code,
            discount_amount=b.discount_amount,
            client_name=b.client_name,
            client_phone=b.client_phone,
            status=b.status,
            user_id=str(b.user_id) if b.user_id else None,
            created_at=b.created_at,
            master=MasterListItem(
                id=str(b.master.id),
                name=b.master.name,
                bio=b.master.bio,
                avatar_url=b.master.avatar_url,
                rating=b.master.rating,
                is_active=b.master.is_active,
                reviews_count=0,
            ),
            service=ServiceResponse(
                id=str(b.service.id),
                name=b.service.name,
                description=b.service.description,
                duration=b.service.duration,
                price=b.service.price,
                category=b.service.category,
                is_active=b.service.is_active,
            ),
        )
        for b in bookings
    ]


@router.put("/{booking_id}/cancel", response_model=BookingCancelResponse)
async def cancel_booking(
    booking_id: str,
    current_user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    booking = await db.get(Booking, booking_id)
    if not booking:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Booking not found")
    if str(booking.user_id) != str(current_user.id):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not your booking")
    if booking.status not in ("pending", "confirmed"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only pending or confirmed bookings can be cancelled",
        )

    booking.status = "cancelled"
    await db.commit()
    await db.refresh(booking)

    return BookingCancelResponse(id=booking_id, status=booking.status)


@router.put("/{booking_id}/reschedule", response_model=BookingDetailResponse)
async def reschedule_booking(
    booking_id: str,
    body: BookingRescheduleRequest,
    current_user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    booking = await db.get(Booking, booking_id)
    if not booking:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Booking not found")
    if str(booking.user_id) != str(current_user.id):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not your booking")
    if booking.status not in ("pending", "confirmed"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only pending or confirmed bookings can be rescheduled",
        )

    booking.date = body.date
    booking.time = body.time
    booking.status = "pending"
    await db.commit()
    await db.refresh(booking)

    booking_with_relations = await db.get(Booking, booking.id)
    await db.refresh(booking_with_relations, attribute_names=["master", "service"])

    return BookingDetailResponse(
        id=str(booking.id),
        master_id=str(booking.master_id),
        service_id=str(booking.service_id),
        date=booking.date,
        time=booking.time,
        client_name=booking.client_name,
        client_phone=booking.client_phone,
        status=booking.status,
        promo_code=booking.promo_code,
        discount_amount=booking.discount_amount,
        user_id=str(booking.user_id) if booking.user_id else None,
        created_at=booking.created_at,
        master=MasterListItem(
            id=str(booking.master.id),
            name=booking.master.name,
            bio=booking.master.bio,
            avatar_url=booking.master.avatar_url,
            rating=booking.master.rating,
            is_active=booking.master.is_active,
            reviews_count=0,
        ),
        service=ServiceResponse(
            id=str(booking.service.id),
            name=booking.service.name,
            description=booking.service.description,
            duration=booking.service.duration,
            price=booking.service.price,
            category=booking.service.category,
            is_active=booking.service.is_active,
        ),
    )
