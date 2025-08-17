from uuid import UUID
from typing import Optional
from sqlmodel import Field, Relationship
from .application_model import ApplicationModel

class Thread(ApplicationModel, table=True):
    __tablename__ = "threads"

    title: str = Field(nullable=False)

    project_id: UUID = Field(
        foreign_key="projects.id",
        nullable=False,
        index=True
    )

    project: Optional["Project"] = Relationship(back_populates="threads")
