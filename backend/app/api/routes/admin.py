import os
import uuid
from datetime import date, datetime, timedelta

from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, status
from pydantic import BaseModel
from sqlalchemy import case, func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.api.deps import get_admin_user
from app.database import get_db
from app.models.booking import Booking
from app.models.master import Master
from app.models.review import Review
from app.models.service import Service
from app.models.user import User
from app.schemas.booking import BookingDetailResponse, BookingResponse
from app.schemas.master import MasterCreate, MasterDetail, MasterListItem
from app.schemas.service import ServiceCreate, ServiceResponse
from app.schemas.user import UserResponse
from app.utils.jwt import create_access_token, decode_access_token

router = APIRouter(prefix="/api/admin", tags=["admin"])


# ── Auth ───────────────────────────────────────────────────────


class AdminLoginRequest(BaseModel):
    token: str


class AdminLoginResponse(BaseModel):
    token: str
    user_id: str


@router.post("/auth/login", response_model=AdminLoginResponse)
async def admin_login(
    body: AdminLoginRequest,
    db: AsyncSession = Depends(get_db),
):
    try:
        payload = decode_access_token(body.token)
    except Exception:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired token")

    if payload.get("purpose") != "admin_login":
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token purpose")

    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")

    user = await db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    if not user.is_admin:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not an admin")

    session_token = create_access_token(str(user.id), user.telegram_id)
    return AdminLoginResponse(token=session_token, user_id=str(user.id))

UPLOAD_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "..", "uploads")
try:
    os.makedirs(UPLOAD_DIR, exist_ok=True)
except OSError:
    UPLOAD_DIR = "/tmp/uploads"
    os.makedirs(UPLOAD_DIR, exist_ok=True)


# ── Services CRUD ──────────────────────────────────────────────


@router.get("/services", response_model=list[ServiceResponse])
async def list_services(
    db: AsyncSession = Depends(get_db),
    _admin=Depends(get_admin_user),
):
    result = await db.execute(select(Service).order_by(Service.name))
    return result.scalars().all()


@router.post("/services", response_model=ServiceResponse, status_code=status.HTTP_201_CREATED)
async def create_service(
    body: ServiceCreate,
    db: AsyncSession = Depends(get_db),
    _admin=Depends(get_admin_user),
):
    service = Service(**body.model_dump())
    db.add(service)
    await db.commit()
    await db.refresh(service)
    return service


@router.put("/services/{service_id}", response_model=ServiceResponse)
async def update_service(
    service_id: str,
    body: ServiceCreate,
    db: AsyncSession = Depends(get_db),
    _admin=Depends(get_admin_user),
):
    service = await db.get(Service, service_id)
    if not service:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Service not found")
    for key, value in body.model_dump().items():
        setattr(service, key, value)
    await db.commit()
    await db.refresh(service)
    return service


@router.delete("/services/{service_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_service(
    service_id: str,
    db: AsyncSession = Depends(get_db),
    _admin=Depends(get_admin_user),
):
    service = await db.get(Service, service_id)
    if not service:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Service not found")
    await db.delete(service)
    await db.commit()


# ── Masters CRUD ───────────────────────────────────────────────


@router.get("/masters", response_model=list[MasterListItem])
async def list_masters(
    db: AsyncSession = Depends(get_db),
    _admin=Depends(get_admin_user),
):
    stmt = (
        select(Master, func.count(Review.id).label("reviews_count"))
        .outerjoin(Review, Review.master_id == Master.id)
        .group_by(Master.id)
        .order_by(Master.name)
    )
    result = await db.execute(stmt)
    return [
        MasterListItem(
            id=str(m.id), name=m.name, bio=m.bio,
            avatar_url=m.avatar_url, rating=m.rating,
            is_active=m.is_active, reviews_count=count,
        )
        for m, count in result.all()
    ]


@router.post("/masters", response_model=MasterListItem, status_code=status.HTTP_201_CREATED)
async def create_master(
    body: MasterCreate,
    db: AsyncSession = Depends(get_db),
    _admin=Depends(get_admin_user),
):
    master = Master(**body.model_dump())
    db.add(master)
    await db.commit()
    await db.refresh(master)
    return MasterListItem(
        id=str(master.id), name=master.name, bio=master.bio,
        avatar_url=master.avatar_url, rating=master.rating,
        is_active=master.is_active, reviews_count=0,
    )


@router.put("/masters/{master_id}", response_model=MasterListItem)
async def update_master(
    master_id: str,
    body: MasterCreate,
    db: AsyncSession = Depends(get_db),
    _admin=Depends(get_admin_user),
):
    master = await db.get(Master, master_id)
    if not master:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Master not found")
    for key, value in body.model_dump().items():
        setattr(master, key, value)
    await db.commit()
    await db.refresh(master)
    return MasterListItem(
        id=str(master.id), name=master.name, bio=master.bio,
        avatar_url=master.avatar_url, rating=master.rating,
        is_active=master.is_active, reviews_count=0,
    )


@router.delete("/masters/{master_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_master(
    master_id: str,
    db: AsyncSession = Depends(get_db),
    _admin=Depends(get_admin_user),
):
    master = await db.get(Master, master_id)
    if not master:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Master not found")
    await db.delete(master)
    await db.commit()


@router.post("/masters/{master_id}/photo", response_model=MasterListItem)
async def upload_master_photo(
    master_id: str,
    file: UploadFile,
    db: AsyncSession = Depends(get_db),
    _admin=Depends(get_admin_user),
):
    master = await db.get(Master, master_id)
    if not master:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Master not found")

    ext = os.path.splitext(file.filename or ".jpg")[1]
    filename = f"{uuid.uuid4()}{ext}"
    filepath = os.path.join(UPLOAD_DIR, filename)
    content = await file.read()
    with open(filepath, "wb") as f:
        f.write(content)

    master.avatar_url = f"/uploads/{filename}"
    await db.commit()
    await db.refresh(master)
    return MasterListItem(
        id=str(master.id), name=master.name, bio=master.bio,
        avatar_url=master.avatar_url, rating=master.rating,
        is_active=master.is_active, reviews_count=0,
    )


# ── Admin Bookings ─────────────────────────────────────────────


@router.get("/bookings", response_model=list[BookingDetailResponse])
async def list_all_bookings(
    status_filter: str | None = Query(None, alias="status"),
    master_id: str | None = Query(None),
    date_from: str | None = Query(None),
    date_to: str | None = Query(None),
    page: int = Query(1, ge=1),
    per_page: int = Query(50, ge=1, le=200),
    db: AsyncSession = Depends(get_db),
    _admin=Depends(get_admin_user),
):
    stmt = (
        select(Booking)
        .options(selectinload(Booking.master), selectinload(Booking.service))
        .order_by(Booking.date.desc(), Booking.time.desc())
    )

    if status_filter:
        stmt = stmt.where(Booking.status == status_filter)
    if master_id:
        stmt = stmt.where(Booking.master_id == master_id)
    if date_from:
        stmt = stmt.where(Booking.date >= date.fromisoformat(date_from))
    if date_to:
        stmt = stmt.where(Booking.date <= date.fromisoformat(date_to))

    stmt = stmt.offset((page - 1) * per_page).limit(per_page)
    result = await db.execute(stmt)
    bookings = result.scalars().all()

    return [
        BookingDetailResponse(
            id=str(b.id), master_id=str(b.master_id), service_id=str(b.service_id),
            date=b.date, time=b.time, client_name=b.client_name, client_phone=b.client_phone,
            status=b.status, user_id=str(b.user_id) if b.user_id else None,
            created_at=b.created_at,
            master=MasterListItem(
                id=str(b.master.id), name=b.master.name, bio=b.master.bio,
                avatar_url=b.master.avatar_url, rating=b.master.rating,
                is_active=b.master.is_active, reviews_count=0,
            ),
            service=ServiceResponse(
                id=str(b.service.id), name=b.service.name, description=b.service.description,
                duration=b.service.duration, price=b.service.price,
                category=b.service.category, is_active=b.service.is_active,
            ),
        )
        for b in bookings
    ]


# ── Analytics / Stats ──────────────────────────────────────────


@router.get("/stats/bookings")
async def stats_bookings(
    period: str = Query("week"),
    db: AsyncSession = Depends(get_db),
    _admin=Depends(get_admin_user),
):
    today = date.today()
    if period == "week":
        start = today - timedelta(days=6)
    elif period == "month":
        start = today - timedelta(days=29)
    elif period == "year":
        start = today - timedelta(days=364)
    else:
        start = today - timedelta(days=6)

    stmt = (
        select(Booking.date, func.count(Booking.id))
        .where(Booking.date >= start)
        .group_by(Booking.date)
        .order_by(Booking.date)
    )
    result = await db.execute(stmt)
    data = {row.date.isoformat(): count for row, count in result.all()}

    labels = []
    values = []
    current = start
    while current <= today:
        labels.append(current.isoformat())
        values.append(data.get(current.isoformat(), 0))
        current += timedelta(days=1)

    return {"labels": labels, "values": values}


@router.get("/stats/top-services")
async def stats_top_services(
    db: AsyncSession = Depends(get_db),
    _admin=Depends(get_admin_user),
):
    stmt = (
        select(Service.name, func.count(Booking.id).label("count"))
        .join(Booking, Booking.service_id == Service.id)
        .where(Booking.status.in_(["confirmed", "completed"]))
        .group_by(Service.name)
        .order_by(func.count(Booking.id).desc())
        .limit(10)
    )
    result = await db.execute(stmt)
    rows = result.all()
    return {"labels": [r.name for r in rows], "values": [r.count for r in rows]}


@router.get("/stats/master-load")
async def stats_master_load(
    db: AsyncSession = Depends(get_db),
    _admin=Depends(get_admin_user),
):
    today = date.today()
    stmt = (
        select(Master.name, func.count(Booking.id).label("count"))
        .outerjoin(Booking, Booking.master_id == Master.id)
        .where(Booking.date >= today - timedelta(days=30), Booking.status.in_(["confirmed", "completed"]))
        .group_by(Master.name)
        .order_by(func.count(Booking.id).desc())
    )
    result = await db.execute(stmt)
    rows = result.all()
    return {"labels": [r.name for r in rows], "values": [r.count for r in rows]}


@router.get("/stats/clients")
async def stats_clients(
    db: AsyncSession = Depends(get_db),
    _admin=Depends(get_admin_user),
):
    subquery = (
        select(
            Booking.user_id,
            func.count(Booking.id).label("booking_count"),
        )
        .where(Booking.user_id.isnot(None))
        .group_by(Booking.user_id)
    ).subquery()

    new_count_q = select(func.count()).select_from(subquery).where(subquery.c.booking_count == 1)
    returning_count_q = select(func.count()).select_from(subquery).where(subquery.c.booking_count > 1)

    new_count = (await db.execute(new_count_q)).scalar() or 0
    returning_count = (await db.execute(returning_count_q)).scalar() or 0

    return {"new_clients": new_count, "returning_clients": returning_count}


@router.get("/stats/total")
async def stats_total(
    db: AsyncSession = Depends(get_db),
    _admin=Depends(get_admin_user),
):
    total_bookings = (await db.execute(select(func.count(Booking.id)))).scalar() or 0
    total_masters = (await db.execute(select(func.count(Master.id)).where(Master.is_active.is_(True)))).scalar() or 0
    total_services = (await db.execute(select(func.count(Service.id)).where(Service.is_active.is_(True)))).scalar() or 0
    total_users = (await db.execute(select(func.count(User.id)))).scalar() or 0

    return {
        "total_bookings": total_bookings,
        "total_masters": total_masters,
        "total_services": total_services,
        "total_users": total_users,
    }
