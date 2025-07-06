import re
from typing import Optional, Annotated

from fastapi import Depends, status, HTTPException

from backend.database.database import User
from backend.database.user_queries import database_create_user, get_user_email, get_user_username, \
    database_update_login_time
from backend.utils.auth.auth import get_password_hash, verify_password
from backend.utils.auth.auth_tokens import get_current_token, get_token_data


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


def _get_user_from_request(token: Optional[str] = Depends(get_current_token)) -> Optional[User]:
    """
    Core function for getting an access token, validating it, and returning
    a user.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"})

    # If no token data was found, return None.
    if not token:
        return None

    # Extract data from the token and get the user from the data.
    token_data = get_token_data(token, "access")
    user = get_user_username(token_data.username)

    if user is None:
        raise credentials_exception

    return user


def get_current_user(current_user: User = Depends(_get_user_from_request)) -> User:
    """
    Get the current user from the oauth2 header.
    """
    if current_user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Bearer"})
    return current_user


def get_current_user_optional(current_user: User = Depends(_get_user_from_request)) -> Optional[User]:
    """
    Optionally get the current user if the request has authorization data.
    """
    return current_user


def get_current_active_user(current_user: Annotated[User, Depends(get_current_user)]) -> User:
    """
    Get the current user from the auth2 header and confirm they are marked as active.
    """
    if current_user.is_active:
        return current_user
    raise HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail="Inactive user")
