from typing import List, Optional
from uuid import UUID
from sqlmodel import Field, Relationship
from .application_model import ApplicationModel

class Project(ApplicationModel, table=True):
    __tablename__ = "projects"

    name: str = Field(
        index=True,
        nullable=False
    )

    user_id: Optional[UUID] = Field(
        default=None,
        foreign_key="users.id",
        index=True,
        nullable=False
    )

    threads: List["Thread"] = Relationship(back_populates="project")
