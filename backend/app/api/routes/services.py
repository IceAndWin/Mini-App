from fastapi import APIRouter, Depends, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.database import get_db
from app.models.service import Service
from app.schemas.service import ServiceResponse

router = APIRouter(prefix="/api/services", tags=["services"])


@router.get("", response_model=list[ServiceResponse])
async def list_services(
    category: str | None = Query(None),
    search: str | None = Query(None),
    db: AsyncSession = Depends(get_db),
):
    stmt = select(Service).where(Service.is_active.is_(True))

    if category:
        stmt = stmt.where(Service.category == category)

    if search:
        stmt = stmt.where(Service.name.ilike(f"%{search}%"))

    stmt = stmt.order_by(Service.category, Service.name)
    result = await db.execute(stmt)
    services = result.scalars().all()
    return list(services)


@router.get("/categories", response_model=list[str])
async def list_categories(db: AsyncSession = Depends(get_db)):
    stmt = (
        select(Service.category)
        .where(Service.category.isnot(None), Service.is_active.is_(True))
        .distinct()
        .order_by(Service.category)
    )
    result = await db.execute(stmt)
    return [row[0] for row in result if row[0]]
