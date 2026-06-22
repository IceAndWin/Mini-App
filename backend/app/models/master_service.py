from sqlalchemy import ForeignKey, Table, Column
from sqlalchemy.dialects.postgresql import UUID

from app.models.base import Base

master_services = Table(
    "master_services",
    Base.metadata,
    Column("master_id", UUID(as_uuid=True), ForeignKey("masters.id"), primary_key=True),
    Column("service_id", UUID(as_uuid=True), ForeignKey("services.id"), primary_key=True),
)
