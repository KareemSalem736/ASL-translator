import re
from datetime import datetime, timezone
from typing import Optional, Annotated

import jwt
from fastapi import Depends, status, HTTPException
from jwt import InvalidTokenError

from backend.database.database import User
from backend.database.user_queries import database_create_user, get_user_email, get_user_username, \
    database_update_login_time
from backend.models.auth_models import TokenData
from backend.utils.auth.auth import get_password_hash, oauth2_scheme, verify_password, SECRET_ACCESS, ALGORITHM


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
    database_update_login_time(user.email)
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
