from sqlalchemy import Boolean, ForeignKey, Integer, String, Time
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, TimestampMixin, UUIDMixin


class MasterSchedule(UUIDMixin, TimestampMixin, Base):
    __tablename__ = "master_schedules"

    master_id: Mapped[str] = mapped_column(
        UUID(as_uuid=True), ForeignKey("masters.id"), nullable=False
    )
    day_of_week: Mapped[int] = mapped_column(
        Integer, nullable=False, comment="0=Monday, 6=Sunday"
    )
    start_time: Mapped[str] = mapped_column(
        String(5), nullable=False, comment="HH:MM"
    )
    end_time: Mapped[str] = mapped_column(
        String(5), nullable=False, comment="HH:MM"
    )
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    master = relationship("Master", backref="schedules")
