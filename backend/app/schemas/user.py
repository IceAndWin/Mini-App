from uuid import UUID

from pydantic import BaseModel


class UserCreate(BaseModel):
    telegram_id: int
    first_name: str
    last_name: str | None = None
    username: str | None = None
    phone: str | None = None


class UserResponse(UserCreate):
    id: UUID
    bonus_points: int = 0
    promo_code: str | None = None

    model_config = {"from_attributes": True}


class TelegramAuthRequest(BaseModel):
    init_data: str
    user: dict | None = None


class AuthResponse(BaseModel):
    token: str
    user_id: str
    telegram_id: int
