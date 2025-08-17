from typing import Annotated, List
from sqlmodel import Session
from langchain.callbacks.base import AsyncCallbackHandler
from typing_extensions import TypedDict
from langgraph.graph.message import add_messages
from .user_session import UserSession

class State(TypedDict):
    messages: Annotated[list, add_messages]
    user_session: UserSession
    callbacks: List[AsyncCallbackHandler]
    db_session: Session
