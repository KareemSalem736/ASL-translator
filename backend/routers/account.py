"""
Router for account backend.
"""
from typing import Optional

from fastapi import APIRouter, Depends, status, HTTPException

from backend.database.prediction_history_queries import get_prediction_history_size, add_prediction_history
from backend.models.account_models import AccountDataResponse, PasswordResetRequest
from backend.utils.auth.auth import update_password
from backend.utils.auth.auth_tokens import get_current_token, is_valid_token, get_user_from_token
from backend.utils.auth.auth_users import get_authenticated_user

# Create router for this class to be referenced by main.
router = APIRouter()


@router.get('/account/add-prediction')
async def add_prediction(prediction_string: str, token: Optional[str] = Depends(get_current_token)):
    """
    Endpoint to add prediction to history
    """
    user = get_user_from_token(token, "access")

    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Bearer"}
        )

    add_prediction_history(prediction_string, user.id)

    return {"message": "Prediction added"}


@router.get('/account/info')
async def info_user(token: Optional[str] = Depends(get_current_token)) -> AccountDataResponse:
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

    return AccountDataResponse(username=user.username, email=user.email,
                               total_predictions=user.total_predictions,
                               prediction_history_size=prediction_history_size, last_login=user.last_login,
                               creation_date=user.created_at)


@router.post('/account/change-password')
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
