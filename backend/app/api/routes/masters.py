from fastapi import APIRouter, Depends
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.database import get_db
from app.models.master import Master
from app.models.review import Review
from app.schemas.master import MasterDetail, MasterListItem

router = APIRouter(prefix="/api/masters", tags=["masters"])


@router.get("", response_model=list[MasterListItem])
async def list_masters(db: AsyncSession = Depends(get_db)):
    stmt = (
        select(
            Master,
            func.count(Review.id).label("reviews_count"),
        )
        .outerjoin(Review, Review.master_id == Master.id)
        .where(Master.is_active.is_(True))
        .group_by(Master.id)
        .order_by(Master.rating.desc())
    )
    result = await db.execute(stmt)
    rows = result.all()

    return [
        MasterListItem(
            id=str(m.id),
            name=m.name,
            bio=m.bio,
            avatar_url=m.avatar_url,
            rating=m.rating,
            is_active=m.is_active,
            reviews_count=count,
        )
        for m, count in rows
    ]


@router.get("/{master_id}", response_model=MasterDetail)
async def get_master(master_id: str, db: AsyncSession = Depends(get_db)):
    stmt = (
        select(Master)
        .where(Master.id == master_id, Master.is_active.is_(True))
        .options(selectinload(Master.reviews))
    )
    result = await db.execute(stmt)
    master = result.scalar_one_or_none()

    if not master:
        from fastapi import HTTPException, status
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Master not found")

    reviews_count = len(master.reviews)

    return MasterDetail(
        id=str(master.id),
        name=master.name,
        bio=master.bio,
        avatar_url=master.avatar_url,
        rating=master.rating,
        is_active=master.is_active,
        reviews_count=reviews_count,
        reviews=list(master.reviews),
    )
