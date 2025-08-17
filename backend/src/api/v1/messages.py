import json
import os
import logging
from uuid import UUID
from sqlalchemy.orm import Session
from langchain_core.messages import AIMessage, HumanMessage
from fastapi import WebSocket, Depends, WebSocketDisconnect
from langgraph.checkpoint.postgres.aio import AsyncPostgresSaver
from ...cortex.graph.builder import builder
from ...cortex.ws_token_streamer import WsTokenStreamer
from ...services.auth.jwt import user_from_ws_token, user_from_token
from .router import router
from ...db.session import get_session
from ...cortex.llm import get_llm
from ...services.websockets.connection_manager import connection_manager
from ...repositories.project import Project as ProjectRepository

@router.websocket("/projects/{project_id}/messages/chat")
async def websocket_endpoint(
    websocket: WebSocket,
    project_id: UUID,
    thread_id: UUID = None,
    db_session: Session = Depends(get_session),
    current_user = Depends(user_from_ws_token)
):
    project = ProjectRepository(db_session).find(project_id)
    await websocket.accept()
    connection_manager.connect(
        namespace="chat",
        project_id=project_id,
        websocket=websocket
    )

    try:
        async with AsyncPostgresSaver.from_conn_string(
            os.getenv("DATABASE_URL_CHECKPOINTER")
        ) as checkpointer:
            graph = builder.compile(checkpointer=checkpointer)
            while True:
                data = await websocket.receive_text()
                data = json.loads(data)

                message = data["message"]
                content = message["content"]

                thread_id = message["metadata"].get("thread_id")
                context_node_ids = message["metadata"].get("context_node_ids") or []

                handler = WsTokenStreamer(
                    websocket=websocket,
                    thread_id=thread_id
                )

                async for _ in graph.astream(
                    input={
                        "messages": [{"role": "user", "content": content}],
                        "user_session": {
                            "user_id": current_user.id,
                            "project_id": project.id,
                            "thread_id": handler.thread_id,
                            "context_node_ids": context_node_ids
                        }
                    },
                    config={
                        "configurable": {
                            "thread_id": handler.thread_id,
                            "context_node_ids": context_node_ids,
                            "llm": get_llm(
                                callbacks=[handler],
                                db_session=db_session,
                                current_user=current_user
                            ),
                            "db_session": db_session,
                            "websocket": websocket,
                            "project": project,
                            "current_user": current_user
                        }
                    }
                ):
                    pass

                await websocket.send_text(json.dumps({
                    "message": {
                        "metadata": {
                            "exit": True
                        }
                    }
                }))
    except WebSocketDisconnect:
        connection_manager.disconnect(
            namespace="chat",
            project_id=project_id,
            websocket=websocket
        )
    except Exception as e: # pylint: disable=broad-except
        logging.error("Error: %s", e, exc_info=True)
        await websocket.send_text(json.dumps({
            "message": {
                "role": "assistant",
                "content": "Something went wrong, Please try again!",
                "metadata": {
                    "thread_id": thread_id,
                    "error": True,
                    "detail": f"Error: {e}"
                }
            }
        }))
    finally:
        db_session.close()

@router.get("/projects/{project_id}/threads/{thread_id}/messages")
async def index(
    project_id: UUID,
    thread_id: UUID,
    db_session: Session = Depends(get_session),
    current_user = Depends(user_from_token)
):
    async with AsyncPostgresSaver.from_conn_string(
        os.getenv("DATABASE_URL_CHECKPOINTER")
    ) as checkpointer:
        previous_messages = []
        results = []
        checkpoint = await checkpointer.aget(
            { "configurable": { "thread_id": str(thread_id) } }
        )

        if checkpoint and "messages" in checkpoint["channel_values"]:
            previous_messages = checkpoint["channel_values"]["messages"]

        for msg in previous_messages:
            if isinstance(msg, HumanMessage):
                results.append({
                    "role": "user",
                    "content": msg.content
                })
            elif isinstance(msg, AIMessage):
                results.append({
                    "role": "assistant",
                    "content": msg.content
                })
            else:
                continue

        return results
