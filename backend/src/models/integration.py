from typing import Dict, Any, Optional
from uuid import UUID
from sqlmodel import Field
from sqlalchemy import Index
from sqlalchemy.dialects.postgresql import JSON
from .application_model import ApplicationModel

class Integration(ApplicationModel, table=True):
    __tablename__ = "integrations"

    name: str = Field(
        index=True,
        nullable=False
    )
    config: Dict[str, Any] = Field(
        default_factory=dict,
        sa_type=JSON
    )
    user_id: Optional[UUID] = Field(
        default=None,
        foreign_key="users.id",
        index=True,
        nullable=False
    )

    __table_args__ = (
        Index("uq_integrations_user_name", "user_id", "name", unique=True),
    )

    @property
    def active(self) -> bool:
        return bool(self.config)
