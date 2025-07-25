"""
Router for authentication backend.
"""
from typing import Annotated, Optional

from fastapi import APIRouter, Depends, status, HTTPException, Response, Request
from fastapi.security import OAuth2PasswordRequestForm

from backend.models.auth_models import RegisterRequest, Token
from backend.utils.auth.auth_tokens import create_tokens, get_current_token, \
    create_access_token, get_token_data
from backend.utils.auth.auth_users import get_authenticated_user, check_user_exists, check_user_email_exists, \
    create_user

# Create router for this class to be referenced by main.
router = APIRouter()


@router.post('/auth/login')
async def login_user(response: Response,
                     form_data: Annotated[OAuth2PasswordRequestForm, Depends()]) -> Token:
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
    # User successfully authenticated, add refresh token as cookie and return access token.
    access_token = create_tokens(data={"sub": user.username}, response=response)

    return Token(username=user.username, access_token=access_token)


@router.post('/auth/register')
async def register_user(response: Response, register_data: RegisterRequest) -> Token:
    """
    Endpoint to handle a user register request.
    """
    # Determine if a user with this username already exists.
    if check_user_exists(register_data.username):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Username already exists",
            headers={"WWW-Authenticate": "Bearer"}
        )
    # Determine if a user with this email already exists.
    if check_user_email_exists(register_data.email):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email already exists",
            headers={"WWW-Authenticate": "Bearer"}
        )

    # Create user and then generate an access and refresh tokens and add as cookies.
    create_user(register_data.username, register_data.email, register_data.password)
    access_token = create_tokens(data={"sub": register_data.username}, response=response)

    return Token(username=register_data.username, access_token=access_token)


@router.post('/auth/logout')
async def logout_user(response: Response):
    """
    Endpoint to handle a user logout request using OAuth2 standards.
    """
    response.delete_cookie('refresh_token')
    response.delete_cookie('is_logged_in')
    return {"message": "Successfully logged out"}


@router.post('/auth/verify')
async def verify_access_token(token: Optional[str] = Depends(get_current_token)):
    """
    Verify submitted user token is valid.
    """
    token_data = get_token_data(token, "access")

    return {"message": f'Token is valid for user {token_data.username}'}


@router.post('/auth/refresh')
async def refresh_access_token(request: Request) -> Token:
    """
    Refresh user token if necessary
    """
    refresh_token = request.cookies.get("refresh_token")

    if refresh_token is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Your session has expired",
            headers={"WWW-Authenticate": "Bearer"}
        )

    # If the token is expired, then the user needs to log in again.
    token_data = get_token_data(refresh_token, "refresh")

    print(token_data.expiration)

    access_token = create_access_token(data={"sub": token_data.username})
    return Token(username=token_data.username, access_token=access_token)
