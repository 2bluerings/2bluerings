from uuid import UUID
from datetime import datetime
from .application_schema import ApplicationSchema

class ThreadCreate(ApplicationSchema):
    title: str

class ThreadRead(ApplicationSchema):
    id: UUID
    title: str
    project_id: UUID
    created_at: datetime
