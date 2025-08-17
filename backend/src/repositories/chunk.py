from sqlmodel import Session
from ..models.chunk import Chunk as ChunkModel
from .application_repository import ApplicationRepository

class Chunk(ApplicationRepository[ChunkModel]):
    def __init__(self, session: Session):
        super().__init__(session, model_class=ChunkModel)
