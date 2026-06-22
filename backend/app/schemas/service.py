from uuid import UUID

from pydantic import BaseModel


class ServiceCreate(BaseModel):
    name: str
    description: str | None = None
    duration: int
    price: float
    category: str | None = None


class ServiceResponse(ServiceCreate):
    id: UUID
    is_active: bool

    model_config = {"from_attributes": True}


class ServiceListParams(BaseModel):
    category: str | None = None
    search: str | None = None
