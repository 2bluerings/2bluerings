from typing import Optional
from uuid import UUID
from datetime import datetime
from .application_schema import ApplicationSchema
from ..models.context_node import (
    ContextNodeType,
    ContextNodeSource,
    ContextNodeStatus
)

class ContextNodeCreate(ApplicationSchema):
    name: Optional[str] = None
    summary: Optional[str] = None
    content: Optional[str] = None
    project_id: UUID
    external_id: Optional[str] = None
    source: ContextNodeSource = ContextNodeSource.MANUAL
    type: ContextNodeType = ContextNodeType.NOTE
    link: Optional[str] = None
    status: ContextNodeStatus = ContextNodeStatus.PENDING
    pos_x: float
    pos_y: float

class ContextNodeRead(ContextNodeCreate):
    id: Optional[UUID] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

class ContextNodeUpdate(ApplicationSchema):
    pos_x: float
    pos_y: float
