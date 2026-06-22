from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.promo_code import PromoCode
from app.schemas.promo_code import PromoCodeValidateRequest, PromoCodeValidateResponse

router = APIRouter(prefix="/api/promocodes", tags=["promocodes"])


@router.post("/validate", response_model=PromoCodeValidateResponse)
async def validate_promo_code(
    body: PromoCodeValidateRequest,
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(PromoCode).where(PromoCode.code == body.code.upper().strip()))
    promo = result.scalar_one_or_none()

    if not promo:
        return PromoCodeValidateResponse(
            code=body.code,
            discount_percent=0,
            valid=False,
            message="Промокод не найден",
        )

    if not promo.is_active:
        return PromoCodeValidateResponse(
            code=body.code,
            discount_percent=0,
            valid=False,
            message="Промокод не активен",
        )

    if promo.used_count >= promo.max_uses:
        return PromoCodeValidateResponse(
            code=body.code,
            discount_percent=0,
            valid=False,
            message="Промокод исчерпан",
        )

    return PromoCodeValidateResponse(
        code=promo.code,
        discount_percent=promo.discount_percent,
        valid=True,
        message=f"Скидка {promo.discount_percent}%",
    )
