from sqlmodel import Session, select, SQLModel
from sqlalchemy import Table, delete
from sqlalchemy.orm import selectinload
from ..models.project import Project as ProjectModel
from ..models.context_node import ContextNode as ContextNodeModel
from ..models.thread import Thread as ThreadModel
from ..models.chunk import Chunk as ChunkModel
from .application_repository import ApplicationRepository

class Project(ApplicationRepository[ProjectModel]):
    def __init__(self, session: Session):
        super().__init__(session, model_class=ProjectModel)

    def all(self) -> list[ProjectModel]:
        statement = (
            select(ProjectModel)
            .options(
                selectinload(ProjectModel.threads)
            )
            # pylint: disable=no-member
            .order_by(ProjectModel.created_at.desc())
        )
        projects = self.session.exec(statement).all()

        for project in projects:
            project.threads.sort(key=lambda t: t.created_at, reverse=True)

        return projects

    def delete_with_children(self, project: ProjectModel) -> None:
        thread_ids = self.session.exec(
            select(
                ThreadModel.id
            ).where(
                ThreadModel.project_id == project.id
            )
        )

        if thread_ids:
            checkpoint_tables = [
                "checkpoints",
                "checkpoint_writes",
                "checkpoint_blobs"
            ]
            for table_name in checkpoint_tables:
                table = Table(
                    table_name, SQLModel.metadata, autoload_with=self.session.bind
                )
                stmt = delete(table).where(
                    table.c.thread_id.in_([str(tid) for tid in thread_ids])
                )
                self.session.exec(stmt)

        self.session.exec(
            delete(ChunkModel).where(ChunkModel.project_id == project.id)
        )
        self.session.exec(
            delete(ContextNodeModel).where(ContextNodeModel.project_id == project.id)
        )
        self.session.exec(
            delete(ThreadModel).where(ThreadModel.project_id == project.id)
        )

        self.session.delete(project)
        self.session.commit()
