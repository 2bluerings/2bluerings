from fastapi import(
    HTTPException,
    Depends
)
from sqlalchemy.orm import Session
from ...services.auth.jwt import user_from_token
from ...repositories.integration import (
    Integration as IntegrationRepository
)
from ...db.session import get_session
from .router import router
from ...config import SUPPORTED_LLM_MODELS

@router.get("/llms")
async def index(
    db: Session = Depends(get_session),
    current_user = Depends(user_from_token)
):
    repo = IntegrationRepository(db)

    try:
        integrations = repo.where(user_id=current_user.id)
        enabled_providers = [
            integration.name for integration in integrations
            if integration.active
        ]
        flat_models = []
        for provider, models in SUPPORTED_LLM_MODELS.items():
            for model, meta in models.items():
                flat_models.append({
                    "provider": provider,
                    "model": model,
                    **meta,
                    "active": provider in enabled_providers,
                })

        return flat_models
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e)) from e
