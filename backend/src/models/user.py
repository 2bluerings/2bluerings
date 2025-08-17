from typing import Optional, Dict, Any
from sqlmodel import Field
from sqlalchemy.dialects.postgresql import JSONB
from pydantic import EmailStr, PrivateAttr
from passlib.context import CryptContext
from .application_model import ApplicationModel

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

class User(ApplicationModel, table=True):
    __tablename__ = "users"

    full_name: str = Field(nullable=False)
    email: EmailStr = Field(nullable=False, unique=True, index=True)
    encrypted_password: str = Field(nullable=False, repr=False)
    _password: Optional[str] = PrivateAttr(default=None)

    # Fine for now, later might need some more work
    settings: Dict[str, Any] = Field(
        default_factory=dict,
        sa_type=JSONB
    )

    @property
    def password(self) -> None:
        return None

    @password.setter
    def password(self, raw: str) -> None:
        self.encrypted_password = pwd_context.hash(raw)
        self._password = None

    def verify_password(self, raw: str) -> bool:
        return pwd_context.verify(raw, self.encrypted_password)
