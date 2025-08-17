from sqlmodel import Session
from sqlalchemy import delete
from ..models.context_node import ContextNode as ContextNodeModel
from ..models.chunk import Chunk as ChunkModel
from .application_repository import ApplicationRepository

class ContextNode(ApplicationRepository[ContextNodeModel]):
    def __init__(self, session: Session):
        super().__init__(session, model_class=ContextNodeModel)

    def delete_with_children(self, context_node: ContextNodeModel) -> None:
        self.session.exec(
            delete(ChunkModel).where(
                (ChunkModel.vectorable_type == "ContextNode") &
                (ChunkModel.vectorable_id == context_node.id)
            )
        )
        self.session.delete(context_node)
        self.session.commit()
