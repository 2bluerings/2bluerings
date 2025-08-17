from uuid import UUID, uuid4
from typing import (
    Optional
)
from datetime import datetime
from sqlmodel import SQLModel, Field
from sqlalchemy.sql.sqltypes import DateTime
from sqlalchemy import text

class ApplicationModel(SQLModel):
    __abstract__ = True
    id: Optional[UUID] = Field(
        default_factory=uuid4,
        primary_key=True,
        index=True,
        nullable=False
    )
    created_at: datetime = Field(
        sa_column_kwargs={
            "server_default": text("NOW()"),
            "nullable": False
        },
        sa_type=DateTime(timezone=True)
    )
    updated_at: datetime = Field(
        sa_column_kwargs={
            "server_default": text("NOW()"),
            "nullable": False
        },
        sa_type=DateTime(timezone=True)
    )
