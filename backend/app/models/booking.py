from datetime import date, time

from datetime import date, time

from sqlalchemy import Boolean, Date, ForeignKey, String, Time
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, TimestampMixin, UUIDMixin


class Booking(UUIDMixin, TimestampMixin, Base):
    __tablename__ = "bookings"

    user_id: Mapped[str | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id"), nullable=True
    )
    master_id: Mapped[str] = mapped_column(
        UUID(as_uuid=True), ForeignKey("masters.id"), nullable=False
    )
    service_id: Mapped[str] = mapped_column(
        UUID(as_uuid=True), ForeignKey("services.id"), nullable=False
    )
    date: Mapped[date] = mapped_column(Date, nullable=False)
    time: Mapped[time] = mapped_column(Time, nullable=False)
    client_name: Mapped[str] = mapped_column(String(256), nullable=False)
    client_phone: Mapped[str] = mapped_column(String(32), nullable=False)
    status: Mapped[str] = mapped_column(
        String(32),
        default="pending",
        nullable=False,
    )
    notified_24h: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    notified_2h: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    user = relationship("User", back_populates="bookings")
    master = relationship("Master", back_populates="bookings")
    service = relationship("Service", back_populates="bookings")
