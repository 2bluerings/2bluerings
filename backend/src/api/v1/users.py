import copy
import logging
from fastapi import (
    HTTPException,
    Depends,
    status
)
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from ...services.auth.jwt import user_from_token
from ...models.user import User as UserModel
from ...schemas.user import (
    UserRead,
    UserSignIn,
    UserSignUp,
    UserWithJwt,
    UserSettingsUpdate
)
from ...services.auth import jwt
from ...repositories.user import (
    User as UserRepository
)
from ...db.session import get_session
from .router import router

@router.post("/users/sign_up", response_model=UserRead)
async def sign_up(
    payload: UserSignUp,
    db: Session = Depends(get_session)
):
    repo = UserRepository(db)
    user = UserModel(
        **payload.model_dump()
    )
    user.password = payload.password
    try:
        user = repo.create(user)
        return UserRead(**user.model_dump())
    except IntegrityError as e:
        raise HTTPException(status_code=400, detail="Email already registered") from e
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e)) from e


@router.post("/users/sign_in", response_model=UserWithJwt, status_code=status.HTTP_200_OK)
async def sign_in(
    payload: UserSignIn,
    db: Session = Depends(get_session)
):
    try:
        repo = UserRepository(db)
        users = repo.where(email=payload.email)

        if not users:
            raise HTTPException(status_code=400, detail="Invalid Credentials")

        user = users[0]
        if not user.verify_password(payload.password):
            raise HTTPException(status_code=400, detail="Invalid Credentials")

        return UserWithJwt(
            **user.model_dump(),
            jwt={
                "token": jwt.user_to_token(user=user)
            }
        )
    except Exception as e:
        logging.error("Error: %s", e, exc_info=True)
        raise HTTPException(status_code=400, detail="Invalid Credentials") from e

@router.put("/users/settings")
async def update_settings(
    payload: UserSettingsUpdate,
    db_session: Session = Depends(get_session),
    current_user = Depends(user_from_token)
):
    try:
        repo = UserRepository(db_session)
        user = current_user

        current_settings = copy.deepcopy(user.settings or {})
        current_settings.update(**payload.model_dump())

        user.settings = current_settings
        repo.update(user)

        return UserRead(**user.model_dump())
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e)) from e
