from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.user import User
from app.schemas.user import AuthResponse, TelegramAuthRequest
from app.config import settings
from app.utils.jwt import create_access_token
from app.utils.telegram import validate_telegram_init_data

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/telegram", response_model=AuthResponse)
async def telegram_auth(
    body: TelegramAuthRequest,
    db: AsyncSession = Depends(get_db),
):
    if not validate_telegram_init_data(body.init_data, settings.bot_token):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid Telegram authentication data",
        )

    user_data = body.user
    if not user_data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User data is required",
        )

    result = await db.execute(
        select(User).where(User.telegram_id == user_data["id"])
    )
    user = result.scalar_one_or_none()

    if user:
        user.first_name = user_data["first_name"]
        user.last_name = user_data.get("last_name")
        user.username = user_data.get("username")
    else:
        user = User(
            telegram_id=user_data["id"],
            first_name=user_data["first_name"],
            last_name=user_data.get("last_name"),
            username=user_data.get("username"),
        )
        db.add(user)

    await db.commit()
    await db.refresh(user)

    token = create_access_token(str(user.id), user.telegram_id)

    return AuthResponse(
        token=token,
        user_id=str(user.id),
        telegram_id=user.telegram_id,
    )
