from pydantic import BaseModel

class ApplicationSchema(BaseModel):
    __abstract__ = True
