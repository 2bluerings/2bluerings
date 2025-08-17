from uuid import UUID
from fastapi import(
    HTTPException,
    Depends
)
from sqlalchemy.orm import Session
from ...services.auth.jwt import user_from_token
from ...models.integration import (
    Integration as IntegrationModel
)
from ...schemas.integration import (
    IntegrationCreate,
    IntegrationUpdate,
    IntegrationRead
)
from ...repositories.integration import (
    Integration as IntegrationRepository
)
from ...db.session import get_session
from .router import router
from ...config import SUPPORTED_INTEGRATIONS


@router.post("/integrations", response_model=IntegrationRead)
async def create(
    payload: IntegrationCreate,
    db: Session = Depends(get_session),
    current_user = Depends(user_from_token)
):
    i = IntegrationModel(
        **payload.model_dump(),
        user_id=current_user.id
    )

    repo = IntegrationRepository(db)

    try:
        i = repo.create(i)
        return IntegrationRead(
            **i.model_dump()
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e)) from e

@router.put("/integrations/{id_}", response_model=IntegrationRead)
async def update(
    id_: UUID,
    payload: IntegrationUpdate,
    db: Session = Depends(get_session),
    current_user = Depends(user_from_token)
):
    repo = IntegrationRepository(db)

    try:
        i = repo.where(
            id=id_,
            user_id=current_user.id
        )

        if not i:
            raise HTTPException(status_code=404, detail="Integration not found")

        i = i[0]
        i.name = payload.name
        i.config = payload.config

        i = repo.update(i)
        return IntegrationRead(
            **i.model_dump()
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e)) from e


@router.get("/integrations", response_model=list[IntegrationRead])
async def index(
    db: Session = Depends(get_session),
    current_user = Depends(user_from_token)
):
    repo = IntegrationRepository(db)

    try:
        integrations = repo.where(user_id=current_user.id)
        results = []

        for k, _ in SUPPORTED_INTEGRATIONS.items():
            integration = IntegrationRead(
                name=k,
                config={}
            )
            saved_integration = next(
                (x for x in integrations if x.name == k), None
            )
            if saved_integration:
                integration.id = saved_integration.id
                integration.config = saved_integration.config
            results.append(integration)
        return results
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e)) from e
