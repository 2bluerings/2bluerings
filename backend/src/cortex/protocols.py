from uuid import UUID
from typing import (
    Protocol,
    Dict,
    Any,
    Optional
)
from pydantic import BaseModel
from ..models.context_node import (
    ContextNodeType,
    ContextNodeSource
)

class Document(BaseModel):
    content: str
    metadata: Dict[str, Any]
    name: str | None

class Chunk(BaseModel):
    content: str
    metadata: Dict[str, Any]

class Chunker(Protocol):
    def __call__(self, content: str) -> list[str]: ...

class Cleaner(Protocol):
    def __call__(self, content: str) -> str: ...

class ContextNodeOutput(BaseModel):
    name: Optional[str] = None
    summary: Optional[str] = None
    content: Optional[str] = None
    project_id: UUID
    external_id: Optional[str] = None
    source: ContextNodeSource = ContextNodeSource.MANUAL
    type: ContextNodeType = ContextNodeType.NOTE
    link: Optional[str] = None

class ToolOutput(BaseModel):
    name: str
    raw_output: Dict[str, Any]
    summary: Optional[str] = None
    context_node: Optional[ContextNodeOutput] = None
