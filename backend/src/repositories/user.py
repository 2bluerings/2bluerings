from sqlmodel import Session
from ..models.user import User as UserModel
from .application_repository import ApplicationRepository

class User(ApplicationRepository[UserModel]):
    def __init__(self, session: Session):
        super().__init__(session, model_class=UserModel)
