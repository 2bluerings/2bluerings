from __future__ import annotations
from uuid import UUID
from typing import List
from sqlalchemy import Index, Text, String
from sqlmodel import Field, Column
from pgvector.sqlalchemy import Vector as PGVector

from .application_model import ApplicationModel  # assumes id, timestamps, etc.

class Chunk(ApplicationModel, table=True):
    __tablename__ = "chunks"

    project_id: UUID = Field(index=True, nullable=False)

    vectorable_id: UUID = Field(nullable=False)
    vectorable_type: str = Field(sa_column=Column(String(255), nullable=False))

    content: str = Field(sa_column=Column(Text, nullable=False))

    # contextualized chunk and it's embedding
    content_ctx: str = Field(sa_column=Column(Text, nullable=False))
    embedding_ctx: List[float] = Field(
        sa_column=Column(PGVector(), nullable=False)
    )

    __table_args__ = (
        Index("ix_chunks_vectorable_type_id", "vectorable_type", "vectorable_id"),
    )
