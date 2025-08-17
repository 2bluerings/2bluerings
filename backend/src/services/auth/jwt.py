import os
from datetime import datetime, timezone, timedelta
from fastapi import (
    HTTPException,
    Depends,
    WebSocket,
    status
)
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from sqlalchemy.orm import Session
from ...repositories.user import User as UserRepository
from ...models.user import User as UserModel
from ...db.session import get_session

SECRET_KEY = os.environ.get("CM_JWT_SECRET")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_DAYS = 7
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/users/sign_in")

def user_to_token(user: UserModel):
    now = datetime.now(timezone.utc)
    expire = now + timedelta(days=ACCESS_TOKEN_EXPIRE_DAYS)
    payload = {
        "iat": int(now.timestamp()),
        "exp": int(expire.timestamp()),
        "scope": "access",
        "sub": str(user.id),
        "email": user.email,
        "full_name": user.full_name
    }
    encoded_jwt = jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)

    return encoded_jwt

def user_from_token(
        token: str = Depends(oauth2_scheme),
        db: Session = Depends(get_session)
):
    credentials_exception = HTTPException(
        status_code=401,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except JWTError as e:
        raise credentials_exception from e

    repo = UserRepository(db)
    user = repo.find(user_id)
    if not user:
        raise credentials_exception

    return user


async def user_from_ws_token(
    websocket: WebSocket,
    db: Session = Depends(get_session),
):
    token = websocket.query_params.get("token")
    detail = "Not authenticated"
    if not token:
        await websocket.close(code=1008)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail=detail
        )

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if not user_id:
            await websocket.close(code=1008)
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED, detail=detail
            )
    except JWTError as e:
        await websocket.close(code=1008)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail=detail
        ) from e

    user = UserRepository(db).find(user_id)
    if not user:
        await websocket.close(code=1008)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail=detail
        )

    return user
