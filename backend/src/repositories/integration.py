from uuid import UUID
from sqlmodel import Session
from ..models.integration import Integration as IntegrationModel
from .application_repository import ApplicationRepository

class Integration(ApplicationRepository[IntegrationModel]):
    def __init__(self, session: Session):
        super().__init__(session, model_class=IntegrationModel)

    def find_config(self, name: str, user_id=UUID):
        i = self.where(name=name, user_id=user_id)
        if not i:
            raise ValueError(f"Integration({name}) not setup.")

        i = i[0]
        config = i.config or {}

        if not config:
            raise ValueError(f"Integration({name}) not setup.")

        return config
