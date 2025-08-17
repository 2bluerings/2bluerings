import logging
from uuid import UUID
from fastapi import (
    HTTPException,
    Depends
)
from sqlalchemy.orm import Session
from ...models.thread import Thread as ThreadModel
from ...services.auth.jwt import user_from_token
from ...schemas.thread import ThreadRead, ThreadCreate
from ...repositories.thread import (
    Thread as ThreadRepository
)
from ...repositories.project import (
    Project as ProjectRepository
)
from ...db.session import get_session
from .router import router
from ...cortex.title_generator import TitleGenerator
from ...cortex.llm import get_llm

@router.get("/projects/{project_id}/threads", response_model=list[ThreadRead])
async def index(
    project_id: UUID,
    db: Session = Depends(get_session),
    current_user = Depends(user_from_token)
):
    repo = ThreadRepository(db)
    try:
        threads = repo.where(project_id=project_id)
        return [ThreadRead(**th.model_dump()) for th in threads]
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e)) from e

@router.post("/projects/{project_id}/threads", response_model=ThreadRead)
async def create(
    project_id: UUID,
    payload: ThreadCreate,
    db_session: Session = Depends(get_session),
    current_user = Depends(user_from_token)
):
    repo = ThreadRepository(db_session)

    try:
        thread = repo.create(
            ThreadModel(
                project_id=project_id,
                title=TitleGenerator(
                    content=payload.title,
                    llm=get_llm(
                        db_session=db_session,
                        current_user=current_user
                    )
                ).call()
            )
        )
        return ThreadRead(**thread.model_dump())
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e)) from e

@router.delete("/threads/{thread_id}", status_code=204)
async def delete_thread(
    thread_id: UUID,
    db: Session = Depends(get_session),
    current_user = Depends(user_from_token)
):
    thread_repo = ThreadRepository(db)
    project_repo = ProjectRepository(db)

    thread = thread_repo.find(thread_id)
    if not thread:
        raise HTTPException(status_code=404, detail="Not found.")

    project = project_repo.find(thread.project_id)
    if not project or project.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Not found.")

    try:
        thread_repo.delete_thread_with_children(thread)
    except Exception as e:
        logging.error("Error: %s", e, exc_info=True)
        raise HTTPException(
            status_code=400, detail=f"Delete failed: {e}"
        ) from e

    return None
