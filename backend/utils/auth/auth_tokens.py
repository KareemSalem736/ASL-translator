from datetime import datetime, timezone, timedelta
from typing import Optional

import jwt
from fastapi import Response, Request, HTTPException, status
from jwt import InvalidTokenError

from backend.models.auth_models import TokenData
from backend.utils.auth.auth import ALGORITHM, SECRET_ACCESS, TOKEN_ACCESS_EXPIRATION, \
    TOKEN_REFRESH_EXPIRATION, SECRET_REFRESH


def get_current_token(request: Request) -> Optional[str]:
    """
    Get the current token from the oauth2 header format.
    """
    # Attempt to get the authorization header
    token = None
    auth_header = request.headers.get("Authorization")
    if auth_header:
        parts = auth_header.split()
        if len(parts) == 2 and parts[0].lower() == "bearer":
            token = parts[1]

    # If no token was found in the header, check the access token cookie.
    if not token:
        token = request.cookies.get("access_token")
    return token


def get_token_data(token: str, token_type: str) -> TokenData:
    """
    Extract token data from JWT.
    """
    if token_type == "access":
        secret = SECRET_ACCESS
    else:
        secret = SECRET_REFRESH

    try:
        payload = jwt.decode(token, secret, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        expiration: int = payload.get("exp")

        # Determine if this token is expired.
        if expiration < datetime.now(timezone.utc).timestamp():
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token expired",
                headers={"WWW-Authenticate": "Bearer"})

        if username is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="The user associated with this token does not exist",
                headers={"WWW-Authenticate": "Bearer"}
            )

        return TokenData(username=username, expiration=expiration)
    except InvalidTokenError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token",
            headers={"WWW-Authenticate": "Bearer"}
        )


def create_access_token(data: dict):
    """
    Create a JWT access token.
    """
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(minutes=TOKEN_ACCESS_EXPIRATION)
    to_encode.update({"exp": expire})
    access_token = jwt.encode(to_encode, SECRET_ACCESS, algorithm=ALGORITHM)

    return access_token


def create_refresh_token(data: dict, response: Response):
    """
    Create a JWT refresh token.
    """
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(days=TOKEN_REFRESH_EXPIRATION)
    to_encode.update({"exp": expire})
    refresh_token = jwt.encode(to_encode, SECRET_REFRESH, algorithm=ALGORITHM)

    response.set_cookie(
        'refresh_token',
        refresh_token,
        httponly=True,
        secure=False,
        samesite='strict',
        max_age=60 * 60 * 24 * 30
    )


def create_tokens(data: dict, response: Response):
    """
    Create refresh and access JWT tokens for new session.
    """
    access_token = create_access_token(data)
    create_refresh_token(data, response)
    return access_token
