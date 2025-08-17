from typing import Dict, Any, Optional
from uuid import UUID
from pydantic import field_validator, computed_field
from .application_schema import ApplicationSchema
from ..config import SUPPORTED_INTEGRATIONS

class IntegrationCreate(ApplicationSchema):
    name: str
    config: Dict[str, Any] = {}

    @field_validator("name")
    @classmethod
    def validate_name(cls, v):
        if v not in SUPPORTED_INTEGRATIONS:
            raise ValueError(f"Unsupported integration: {v}")
        return v

class IntegrationUpdate(IntegrationCreate):
    pass

class IntegrationRead(ApplicationSchema):
    id: Optional[UUID] = None
    name: str
    config: Dict[str, Any] = {}

    @computed_field
    @property
    def active(self) -> bool:
        return bool(self.config)

    @computed_field
    @property
    def display_name(self) -> bool:
        return SUPPORTED_INTEGRATIONS[self.name]["name"]

    @computed_field
    @property
    def type(self) -> bool:
        return SUPPORTED_INTEGRATIONS[self.name]["type"]

    @computed_field
    @property
    def description(self) -> bool:
        return SUPPORTED_INTEGRATIONS[self.name]["description"]

    @computed_field
    @property
    def logo(self) -> bool:
        return SUPPORTED_INTEGRATIONS[self.name]["logo"]

    @computed_field
    @property
    def placeholder(self) -> bool:
        return SUPPORTED_INTEGRATIONS[self.name]["placeholder"]

    @computed_field
    @property
    def supported(self) -> bool:
        return SUPPORTED_INTEGRATIONS[self.name]["supported"]
