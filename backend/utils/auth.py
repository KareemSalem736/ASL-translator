"""
Utility functions for performing actions with authentication.
"""
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

# constant variables pulled from config
SECRET_ACCESS = get_config().get("AUTH", "secret_access")
SECRET_REFRESH = get_config().get("AUTH", "secret_refresh")
ALGORITHM = get_config().get("AUTH", "algorithm")
TOKEN_ACCESS_EXPIRATION = int(get_config().get("AUTH", "refresh_token_expire_days"))
TOKEN_REFRESH_EXPIRATION = int(get_config().get("AUTH", "access_token_expire_minutes"))

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")


class TokenData(BaseModel):
    """
    A class representing the data in a token.
    """
    username: Optional[str] = None


def get_password_hash(password: str) -> str:
    """
    Get a hash of a password.
    """
    pwd_bytes = password.encode("utf-8")
    hashed_password = bcrypt.hashpw(pwd_bytes, bcrypt.gensalt()).decode("utf-8")
    return hashed_password


def verify_password(plain_password: str, hashed_password: bytes) -> bool:
    """
    Verify a password against a hashed password.
    """
    password_bytes = plain_password.encode("utf-8")
    return bcrypt.checkpw(password_bytes, hashed_password)


def check_user_exists(username):
    """
    Check if a user exists based on username.
    """
    if get_user_username(username):
        return True
    return False


def check_user_email_exists(email):
    """
    Check if a user exists based on email.
    """
    if get_user_email(email):
        return True
    return False


def create_user(username: str, email: str, password: str):
    """
    Create a new user.
    """
    database_create_user(username, email, get_password_hash(password))


def get_current_token(token: str = Depends(oauth2_scheme)):
    """
    Get the current token from the oauth2 header format.
    """
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing token header"
        )
    return token


def get_user(identifier: str) -> Optional[User]:
    """
    Get a user based on identifier. Can be username or email.
    """
    # Regex for matching a username.
    email_regex = r"^\S+@\S+\.\S+$"

    if re.match(email_regex, identifier):
        return get_user_email(identifier)
    return get_user_username(identifier)


def get_authenticated_user(identifier: str, password: str) -> Optional[User]:
    """
    Get a user and authenticate them with provided password.
    """
    user = get_user(identifier)
    if not user:
        return None
    if not verify_password(password, user.password_hashed.encode("utf-8")):
        return None
    return user


def get_current_user(token: Annotated[str, Depends(oauth2_scheme)]) -> User:
    """
    Get the current user from the oauth2 header.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    # Try to extract the username from the jwt token.
    try:
        payload = jwt.decode(token, SECRET_ACCESS, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        exp: datetime = payload.get("exp")

        # Determine if this token is expired.
        if exp < datetime.now(timezone.utc):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token expired",
                headers={"WWW-Authenticate": "Bearer"},
            )
        if username is None:
            raise credentials_exception
        token_data = TokenData(username=username)
    except InvalidTokenError:
        raise credentials_exception
    user = get_user_username(token_data.username)
    if user is None:
        raise credentials_exception
    return user


def get_current_active_user(current_user: Annotated[User, Depends(get_current_user)]) -> User:
    """
    Get the current user from the auth2 header and confirm they are marked as active.
    """
    if current_user.is_active:
        return current_user
    raise HTTPException(status_code=400, detail="Inactive user")


def get_user_from_token(token: str, token_type: str) -> Optional[User]:
    """
    Get a user based on their jwt token.
    """
    # Using token_type determine which secret needs to be used for decoding.
    if token_type == "access":
        secret = SECRET_ACCESS
    else:
        secret = SECRET_REFRESH

    decoded_token: dict = jwt.decode(token, secret, algorithms=[ALGORITHM])
    return get_user(decoded_token.get("sub"))


def is_token_expired(token: str, token_type: str) -> bool:
    """
    Check if the supplied token is expired.
    """
    # Using token_type determine which secret needs to be used for decoding.
    if token_type == "access":
        secret = SECRET_ACCESS
    else:
        secret = SECRET_REFRESH

    decoded_token: dict = jwt.decode(token.encode('utf-8'), secret, algorithms=[ALGORITHM])
    access_expiration: int = decoded_token.get("exp")

    if access_expiration < datetime.now(timezone.utc).timestamp():
        return True
    return False


def create_access_token(data: dict) -> str:
    """
    Create a JWT access token.
    """
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(days=TOKEN_ACCESS_EXPIRATION)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_ACCESS, algorithm=ALGORITHM)
    return encoded_jwt


def create_refresh_token(data: dict) -> str:
    """
    Create a JWT refresh token.
    """
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(days=TOKEN_REFRESH_EXPIRATION)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_REFRESH, algorithm=ALGORITHM)
    return encoded_jwt
