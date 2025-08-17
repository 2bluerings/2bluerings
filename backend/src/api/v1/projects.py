import logging
from typing import List
from uuid import UUID
from fastapi import(
    HTTPException,
    Depends
)
from sqlalchemy.orm import Session
from ...models.project import (
    Project as ProjectModel
)
from ...schemas.project import (
    ProjectCreate,
    ProjectUpdate,
    ProjectWithThreadsRead
)
from ...repositories.project import (
    Project as ProjectRepository
)
from ...db.session import get_session
from .router import router
from ...services.auth.jwt import user_from_token

@router.post("/projects", response_model=ProjectWithThreadsRead)
async def create(
    payload: ProjectCreate,
    db: Session = Depends(get_session),
    current_user = Depends(user_from_token)
):
    project = ProjectModel(
        **payload.model_dump(),
        user_id=current_user.id
    )

    repo = ProjectRepository(db)

    try:
        return ProjectWithThreadsRead.model_validate(
            repo.create(project), from_attributes=True
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e)) from e


@router.get("/projects/{id_}", response_model=ProjectWithThreadsRead)
async def show(
    id_: int,
    db: Session = Depends(get_session),
    current_user = Depends(user_from_token)
):
    repo = ProjectRepository(db)

    try:
        c = repo.where(id=id_, user_id=current_user.id)
        if not c:
            raise HTTPException(status_code=404, detail="Project not found")

        return ProjectWithThreadsRead.model_validate(
            c[0], from_attributes=True
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e)) from e


@router.put("/projects/{id_}", response_model=ProjectWithThreadsRead)
async def update(
    id_: int,
    payload: ProjectUpdate,
    db: Session = Depends(get_session),
    current_user = Depends(user_from_token)
):
    repo = ProjectRepository(db)

    try:
        c = repo.where(id=id_, user_id=current_user.id)
        if not c:
            raise HTTPException(status_code=404, detail="Project not found")

        c = c[0]
        c.name = payload.name
        c = repo.update(c)

        return ProjectWithThreadsRead.model_validate(
            c, from_attributes=True
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e)) from e

@router.get("/projects", response_model=List[ProjectWithThreadsRead])
async def index(
    db: Session = Depends(get_session),
    current_user = Depends(user_from_token)
):
    try:
        projects = ProjectRepository(db).where(user_id=current_user.id)
        return [
            ProjectWithThreadsRead.model_validate(p, from_attributes=True) for p in projects
        ]
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e)) from e


@router.delete("/projects/{project_id}", status_code=204)
async def delete_project(
    project_id: UUID,
    db: Session = Depends(get_session),
    current_user = Depends(user_from_token)
):
    repo = ProjectRepository(db)
    try:
        project = repo.where(id=project_id, user_id=current_user.id)
        if not project:
            raise HTTPException(status_code=404, detail="Project not found")
        repo.delete_with_children(project[0])
        return
    except Exception as e:
        logging.error("Error: %s", e, exc_info=True)
        raise HTTPException(status_code=400, detail=str(e)) from e
