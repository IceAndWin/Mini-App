from datetime import date, datetime, time

from pydantic import BaseModel

from app.schemas.master import MasterListItem
from app.schemas.service import ServiceResponse


class BookingCreate(BaseModel):
    master_id: str
    service_id: str
    date: date
    time: time
    client_name: str
    client_phone: str
    user_id: str | None = None


class BookingResponse(BaseModel):
    id: str
    master_id: str
    service_id: str
    date: date
    time: time
    client_name: str
    client_phone: str
    status: str
    user_id: str | None = None

    model_config = {"from_attributes": True}


class BookingDetailResponse(BaseModel):
    id: str
    master_id: str
    service_id: str
    date: date
    time: time
    client_name: str
    client_phone: str
    status: str
    user_id: str | None = None
    created_at: datetime
    master: MasterListItem
    service: ServiceResponse

    model_config = {"from_attributes": True}


class BookingCancelResponse(BaseModel):
    id: str
    status: str
    message: str = "Booking cancelled"


class BookingRescheduleRequest(BaseModel):
    date: date
    time: time


class AvailableSlot(BaseModel):
    time: str
    available: bool


class AvailableSlotsResponse(BaseModel):
    date: str
    master_id: str
    slots: list[AvailableSlot]
