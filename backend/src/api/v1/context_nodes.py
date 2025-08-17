import logging
from uuid import UUID
from fastapi import (
    HTTPException,
    Depends,
    WebSocket,
    WebSocketDisconnect,
    status
)
from sqlalchemy.orm import Session
from ...services.auth.jwt import user_from_token
from ...schemas.context_node import (
    ContextNodeRead,
    ContextNodeUpdate
)
from ...repositories.context_node import (
    ContextNode as ContextNodeRepository
)
from ...repositories.project import (
    Project as ProjectRepository
)
from ...db.session import get_session
from .router import router
from ...services.websockets.connection_manager import connection_manager


@router.put("/context_nodes/{id_}", response_model=ContextNodeRead)
async def create(
    id_: UUID,
    payload: ContextNodeUpdate,
    db: Session=Depends(get_session),
    current_user = Depends(user_from_token)
):
    repo = ContextNodeRepository(db)
    project_repo = ProjectRepository(db)

    try:
        node = repo.find(id_)
        if not node:
            raise HTTPException(status_code=404, detail="Not found.")

        project = project_repo.find(node.project_id)
        if not project or project.user_id != current_user.id:
            raise HTTPException(status_code=404, detail="Not found.")

        node.pos_x = payload.pos_x
        node.pos_y = payload.pos_y

        node = repo.update(node)
        return ContextNodeRead(
            **node.model_dump()
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e)) from e


@router.websocket("/projects/{project_id}/context_nodes/stream")
async def stream_context_nodes(
    websocket: WebSocket,
    project_id: UUID,
    db: Session = Depends(get_session)
):
    await websocket.accept()
    connection_manager.connect(
        namespace="context_nodes",
        project_id=project_id,
        websocket=websocket
    )

    repo = ContextNodeRepository(db)
    try:
        nodes = repo.where(project_id=project_id)
        for node in nodes:
            await websocket.send_json(
                ContextNodeRead(**node.model_dump()).model_dump(mode="json")
            )
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        pass

@router.get("/projects/{project_id}/context_nodes", response_model=list[ContextNodeRead])
async def index(
    project_id: UUID,
    db: Session = Depends(get_session),
    current_user = Depends(user_from_token)
):
    repo = ContextNodeRepository(db)
    project_repo = ProjectRepository(db)
    try:
        project = project_repo.find(project_id)
        if not project or project.user_id != current_user.id:
            raise HTTPException(status_code=404, detail="Not found.")

        nodes = repo.where(project_id=project_id)
        return [ContextNodeRead(**n.model_dump()) for n in nodes]
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e)) from e


@router.delete(
    "/context_nodes/{id_}",
    status_code=status.HTTP_204_NO_CONTENT
)
async def delete_context_node(
    id_: UUID,
    db: Session = Depends(get_session),
    current_user = Depends(user_from_token)
):
    repo = ContextNodeRepository(db)
    node = repo.find(id_)
    if not node:
        raise HTTPException(status_code=404, detail="Context node not found")

    project_repo = ProjectRepository(db)
    project = project_repo.find(node.project_id)
    if not project or project.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Context node not found")

    try:
        repo.delete_with_children(node)
    except Exception as e:
        logging.error("Error: %s", e, exc_info=True)
        raise HTTPException(
            status_code=400, detail=f"Failed to delete context node: {str(e)}"
        ) from e

    return None
