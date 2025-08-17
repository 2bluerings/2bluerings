from uuid import UUID
from enum import Enum
from typing import Optional
from sqlmodel import Field
from sqlalchemy import Text, Column
from sqlalchemy.dialects.postgresql import JSONB
from .application_model import ApplicationModel


class ContextNodeSource(str, Enum):
    WEB = "web"
    SLACK = "slack"
    CONFLUENCE = "confluence"
    JIRA = "jira"
    NOTION = "notion"
    GITHUB = "github"
    MANUAL = "manual"
    SYSTEM = "system"

class ContextNodeType(str, Enum):
    NOTE = "note"
    MARKDOWN = "markdown"
    FILE = "file"
    LINK = "link"
    INTEGRATION = "integration"
    AUTO = "auto"

class ContextNodeStatus(str, Enum):
    PENDING = "pending"
    INDEXING = "indexing"
    COMPLETED = "completed"

class ContextNode(ApplicationModel, table=True):
    __tablename__ = "context_nodes"

    name: str = Field(
        index=True,
        nullable=False
    )
    summary: Optional[str] = Field(
        default=None,
        nullable=True
    )
    content: Optional[str] = Field(
        default=None,
        sa_column=Column(Text, nullable=True)
    )
    project_id: UUID = Field(
        foreign_key="projects.id",
        nullable=False
    )
    external_id: Optional[str] = Field(
        default=None,
        nullable=True,
        index=True
    )
    source: str = Field(
        default=ContextNodeSource.MANUAL,
        nullable=False,
        index=True
    )
    type: str = Field(
        default=ContextNodeType.NOTE,
        nullable=False,
        index=True
    )
    link: Optional[str] = Field(
        default=None,
        nullable=True,
        index=True
    )
    status: str = Field(
        default=ContextNodeStatus.PENDING,
        nullable=False,
        index=True
    )
    episode_uuids: Optional[list[str]] = Field(
        default=None,
        sa_column=Column(JSONB, nullable=True)
    )
    pos_x: float = Field(
        default=0.0,
        description="X position of the node"
    )
    pos_y: float = Field(
        default=0.0,
        description="Y position of the node"
    )
