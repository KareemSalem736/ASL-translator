import re
from datetime import datetime, timedelta, timezone
from typing import Optional, Annotated

import bcrypt
import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jwt import InvalidTokenError
from pydantic import BaseModel

from backend.configs.config import get_config
from backend.database.database import User
from backend.database.user_queries import get_user_username, get_user_email, database_create_user

SECRET = get_config().get("AUTH", "secret")
SALT = get_config().get("AUTH", "salt")
ALGORITHM = get_config().get("AUTH", "algorithm")
TOKEN_EXPIRATION = int(get_config().get("AUTH", "access_token_expire_minutes"))

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")


class TokenData(BaseModel):
    username: Optional[str] = None


def get_password_hash(password: str) -> str:
    pwd_bytes = password.encode("utf-8")
    hashed_password = bcrypt.hashpw(pwd_bytes, bcrypt.gensalt()).decode("utf-8")
    return hashed_password


def verify_password(plain_password: str, hashed_password: bytes) -> bool:
    password_bytes = plain_password.encode("utf-8")
    return bcrypt.checkpw(password_bytes, hashed_password)


def check_user_exists(username):
    if get_user_username(username):
        return True
    return False


def check_user_email_exists(email):
    if get_user_email(email):
        return True
    return False


def create_user(username: str, email: str, password: str):
    database_create_user(username, email, get_password_hash(password))


def get_user(identifier: str) -> Optional[User]:
    email_regex = r"^\S+@\S+\.\S+$"

    if re.match(email_regex, identifier):
        return get_user_email(identifier)
    else:
        return get_user_username(identifier)


def get_authenticated_user(identifier: str, password: str) -> Optional[User]:
    user = get_user(identifier)
    if not user:
        return None
    if not verify_password(password, user.password_hashed.encode("utf-8")):
        return None
    return user


async def get_current_user(token: Annotated[str, Depends(oauth2_scheme)]) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
        token_data = TokenData(username=username)
    except InvalidTokenError:
        raise credentials_exception
    user = get_user_username(token_data.username)
    if user is None:
        raise credentials_exception
    return user


async def get_current_active_user(current_user: Annotated[User, Depends(get_current_user)]) -> User:
    if current_user.is_active:
        return current_user
    raise HTTPException(status_code=400, detail="Inactive user")


def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(minutes=TOKEN_EXPIRATION)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET, algorithm=ALGORITHM)
    return encoded_jwt
