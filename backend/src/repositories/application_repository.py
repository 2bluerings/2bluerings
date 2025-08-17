from typing import Generic, TypeVar, Optional
from sqlmodel import Session, select
from ..models.application_model import ApplicationModel

T = TypeVar("T", bound=ApplicationModel)

class ApplicationRepository(Generic[T]):
    def __init__(self, session: Session, model_class: type[T]):
        self.session = session
        self.model_class = model_class

    def create(self, model: T) -> T:
        self.session.add(model)
        self.session.commit()
        self.session.refresh(model)
        return model

    def update(self, model: T) -> T:
        self.session.commit()
        self.session.refresh(model)
        return model

    def find(self, id_: int) -> Optional[T]:
        return self.session.get(self.model_class, id_)

    def all(self) -> list[T]:
        statement = select(self.model_class)
        statement = statement.order_by(
            self.model_class.created_at.desc()
        )
        results = self.session.exec(statement)
        return results.all()

    def where(self, **kwargs) -> list[T]:
        filters = [
            getattr(self.model_class, key) == value
            for key, value in kwargs.items()
            if hasattr(self.model_class, key)
        ]

        statement = select(self.model_class).where(*filters).order_by(
            self.model_class.created_at.desc()
        )
        return self.session.exec(statement).all()

    def delete(self, model: T) -> None:
        self.session.delete(model)
        self.session.commit()
