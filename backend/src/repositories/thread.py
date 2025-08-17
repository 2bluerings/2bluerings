from sqlmodel import Session, SQLModel
from sqlalchemy import Table, delete
from ..models.thread import Thread as ThreadModel
from .application_repository import ApplicationRepository

class Thread(ApplicationRepository[ThreadModel]):
    def __init__(self, session: Session):
        super().__init__(session, model_class=ThreadModel)

    def delete_thread_with_children(self, thread: ThreadModel) -> None:
        checkpoint_tables = [
            "checkpoints",
            "checkpoint_writes",
            "checkpoint_blobs"
        ]

        for table_name in checkpoint_tables:
            table = Table(
                table_name, SQLModel.metadata, autoload_with=self.session.bind
            )
            stmt = delete(table).where(table.c.thread_id == str(thread.id))
            self.session.exec(stmt)

        self.session.delete(thread)
        self.session.commit()
