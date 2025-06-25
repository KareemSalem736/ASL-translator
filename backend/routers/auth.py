"""
Router for authentication backend.
"""
from typing import Annotated, Optional

from fastapi import APIRouter, Depends, status, HTTPException, Response, Request
from fastapi.security import OAuth2PasswordRequestForm

from backend.database.prediction_history_queries import get_prediction_history_size
from backend.models.auth_models import Token, PasswordResetRequest, RegisterRequest, UserDataResponse
from backend.utils.auth.auth import update_password
from backend.utils.auth.auth_tokens import create_tokens, get_current_token, is_valid_token, get_user_from_token, \
    create_access_token
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
    # User successfully authenticated, create access token and send to user.
    access_token = create_tokens(data={"sub": user.username}, response=response)

    return Token(username=user.username, access_token=access_token, token_type="bearer")


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

    # Create user and then generate an access token to send to the user.
    create_user(register_data.username, register_data.email, register_data.password)
    access_token = create_tokens(data={"sub": register_data.username}, response=response)

    return Token(username=register_data.username, access_token=access_token, token_type="bearer")


@router.get('/auth/info')
async def info_user(token: Optional[str] = Depends(get_current_token)) -> UserDataResponse:
    """
    Endpoint to get the current user information.
    """
    user = get_user_from_token(token, "access")

    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="You are not logged in",
            headers={"WWW-Authenticate": "Bearer"}
        )

    prediction_history_size = get_prediction_history_size(user.email)

    return UserDataResponse(username=user.username, email=user.email,
                            total_predictions=user.total_predictions,
                            prediction_history_size=prediction_history_size, last_login=user.last_login,
                            creation_date=user.created_at)


@router.post('/auth/logout')
async def logout_user(response: Response):
    """
    Endpoint to handle a user logout request using OAuth2 standards.
    """
    response.delete_cookie('refresh_token')
    return {"message": "Successfully logged out"}


@router.post('/auth/changepassword')
async def reset_password(data: PasswordResetRequest,
                         token: Optional[str] = Depends(get_current_token)):
    """
    Endpoint to handle password reset requests.
    """
    valid, message = is_valid_token(token, "access")

    if not valid:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=message,
            headers={"WWW-Authenticate": "Bearer"}
        )
    # Extract the user from the token and then confirm
    # if the password for the user is correct.
    user = get_user_from_token(token, "access")
    user = get_authenticated_user(user.username, data.current_password)

    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Your current password is incorrect",
            headers={"WWW-Authenticate": "Bearer"}
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Inactive user",
            headers={"WWW-Authenticate": "Bearer"}
        )

    user = update_password(user.email, data.new_password)

    if user is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An unknown error occurred during password reset",
            headers={"WWW-Authenticate": "Bearer"}
        )

    return {"message": "Password reset successful"}


@router.post('/auth/verify')
async def verify_access_token(token: Optional[str] = Depends(get_current_token)):
    """
    Verify submitted user token is valid.
    """
    valid, message = is_valid_token(token, "access")

    if not valid:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=message,
            headers={"WWW-Authenticate": "Bearer"}
        )

    return {"message": "Token is valid."}


@router.post('/auth/refresh')
async def refresh_access_token(request: Request):
    """
    Refresh user token if necessary
    """
    refresh_token = request.cookies.get("refresh_token")

    # If the token is expired, then the user needs to log in again.
    valid, message = is_valid_token(refresh_token, "refresh")

    if not valid:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=message,
            headers={"WWW-Authenticate": "Bearer"}
        )

    user = get_user_from_token(refresh_token, "refresh")

    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token",
            headers={"WWW-Authenticate": "Bearer"}
        )

    access_token = create_access_token(data={"sub": user.username})
    return Token(username=user.username, access_token=access_token, token_type="bearer")
