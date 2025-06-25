from datetime import datetime, timezone, timedelta
from typing import Optional

import jwt
from fastapi import Response, Depends

from backend.database.database import User
from backend.utils.auth.auth import oauth2_scheme, ALGORITHM, SECRET_ACCESS, TOKEN_ACCESS_EXPIRATION, \
    TOKEN_REFRESH_EXPIRATION, SECRET_REFRESH
from backend.utils.auth.auth_users import get_user


def get_current_token(token: Optional[str] = Depends(oauth2_scheme)):
    """
    Get the current token from the oauth2 header format.
    """
    return token


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


def is_valid_token(token: str, token_type: str) -> {bool, str}:
    if token is None:
        return False, "Token missing"

    if is_token_expired(token, token_type):
        return False, "Token expired"
    return True, "Token is valid"


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


def create_tokens(data: dict, response: Response) -> str:
    """
    Create refresh and access JWT tokens for new session. Add refresh token to response cookie.
    """
    access_token = create_access_token(data)
    refresh_token = create_refresh_token(data)

    response.set_cookie(
        'refresh_token',
        refresh_token,
        httponly=True,
        secure=False,
        samesite='strict',
        max_age=60 * 60 * 24 * 30
    )
    return access_token
