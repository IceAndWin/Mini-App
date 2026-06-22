from datetime import datetime

from pydantic import BaseModel


class ReviewCreate(BaseModel):
    rating: int
    text: str | None = None
    client_name: str
    master_id: str


class ReviewResponse(BaseModel):
    id: str
    rating: int
    text: str | None = None
    client_name: str
    created_at: datetime

    model_config = {"from_attributes": True}


class MasterCreate(BaseModel):
    name: str
    bio: str | None = None
    avatar_url: str | None = None
    user_id: str | None = None


class MasterListItem(BaseModel):
    id: str
    name: str
    bio: str | None = None
    avatar_url: str | None = None
    rating: float
    is_active: bool
    reviews_count: int = 0

    model_config = {"from_attributes": True}


class MasterDetail(MasterListItem):
    reviews: list[ReviewResponse] = []

    model_config = {"from_attributes": True}
