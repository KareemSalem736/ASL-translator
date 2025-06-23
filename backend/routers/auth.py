"""
Router for authentication backend.
"""
from typing import Annotated

from fastapi import APIRouter, Depends, status, HTTPException, Response, Request
from fastapi.security import OAuth2PasswordRequestForm, OAuth2AuthorizationCodeBearer
from pydantic import BaseModel

from backend.database.database import User
from backend.utils.auth import (create_access_token, get_authenticated_user,
                                check_user_exists, check_user_email_exists, create_user,
                                create_refresh_token, is_token_expired, get_user_from_token, get_current_token)

# Create router for this class to be referenced by main.
router = APIRouter()


class Token(BaseModel):
    """
    A model that represents a token to be sent to the user.
    """
    username: str
    access_token: str
    token_type: str


class TokenVerification(BaseModel):
    username: str
    access_token: str


class TokenRefresh(BaseModel):
    """
    A model that represents a request for a new refresh token.
    """
    username: str
    access_token: str


class AuthResponse(BaseModel):
    """
    A model that represents authentication response data to send to browser.
    """
    username: str
    message: str
    access_token: str
    token_type: str


class RegisterRequest(BaseModel):
    """
    A model that represents data received for a registration request.
    """
    username: str
    email: str
    password: str


@router.post('/auth/login')
async def login_user(response: Response, form_data: Annotated[OAuth2PasswordRequestForm, Depends()]) -> Token:
    """
    Endpoint to handle a user login request using OAuth2 standards.
    """
    # Attempt to get an authenticated user based off of the supplied data.
    user = get_authenticated_user(form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"}
        )
    # User successfully authenticated, create access token and send to user.
    refresh_token = create_refresh_token(data={"sub": user.username})
    access_token = create_access_token(data={"sub": user.username})

    response.set_cookie(
        'refresh_token',
        refresh_token,
        httponly=True,
        secure=False,
        samesite='strict',
        max_age=60 * 60 * 24 * 30
    )

    return Token(username=user.username, access_token=access_token, token_type="bearer")


@router.post('/auth/register')
async def register_user(response: Response, register_data: RegisterRequest) -> Token:
    """
    Endpoint to handle a user register request.
    """
    # Determine if a user with this username already exists.
    if check_user_exists(register_data.username):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already exists",
            headers={"WWW-Authenticate": "Bearer"}
        )
    # Determine if a user with this email already exists.
    if check_user_email_exists(register_data.email):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already exists",
            headers={"WWW-Authenticate": "Bearer"}
        )

    # Create user and then generate an access token to send to the user.
    user = create_user(register_data.username, register_data.email, register_data.password)
    refresh_token = create_refresh_token(data={"sub": user.username})
    access_token = create_access_token(data={"sub": user.username})

    response.set_cookie(
        'refresh_token',
        refresh_token,
        httponly=True,
        secure=False,
        samesite='strict',
        max_age=60 * 60 * 24 * 30
    )

    return Token(username=register_data.username, access_token=access_token, token_type="bearer")


@router.post('/auth/logout')
async def logout_user(response: Response):
    """
    Endpoint to handle a user logout request using OAuth2 standards.
    """
    response.delete_cookie('refresh_token')
    return {"message": "Successfully logged out"}


@router.post('/auth/verify')
async def verify_access_token(token: str = Depends(get_current_token)):
    """
    Verify submitted user token is valid.
    """
    if token is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token is missing",
            headers={"WWW-Authenticate": "Bearer"}
        )

    if is_token_expired(token, "access"):
        return HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Access token is expired",
            headers={"WWW-Authenticate": "Bearer"}
        )
    return {"message": "Token is valid."}


@router.post('/auth/refresh')
async def refresh_access_token(request: Request):
    """
    Refresh user token if necessary
    """
    refresh_token = request.cookies.get("refresh_token")

    # If the token is expired, then the user needs to login again.
    if is_token_expired(refresh_token, "refresh"):
        return HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token is expired. Please login again.",
            headers={"WWW-Authenticate": "Bearer"}
        )

    user = get_user_from_token(refresh_token, "refresh")

    access_token = create_access_token(data={"sub": user.username})
    return Token(username=user.username, access_token=access_token, token_type="bearer")
