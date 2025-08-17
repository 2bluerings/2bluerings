from sqlmodel import Session
from .engine import engine

def get_session():
    with Session(engine) as session:
        yield session
