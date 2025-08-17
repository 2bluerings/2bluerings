from uuid import UUID
from typing import Annotated, List
from pydantic import StringConstraints
from .application_schema import ApplicationSchema
from .thread import ThreadRead

class ProjectCreate(ApplicationSchema):
    name: Annotated[
        str, StringConstraints(max_length=255, min_length=3)
    ]

class ProjectUpdate(ProjectCreate):
    pass

class ProjectWithThreadsRead(ApplicationSchema):
    id: UUID
    name: str
    threads: List[ThreadRead]
