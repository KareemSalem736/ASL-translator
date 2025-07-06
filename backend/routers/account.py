"""
Router for account backend.
"""
from datetime import datetime

from fastapi import APIRouter, Depends, status, HTTPException
from pydantic import BaseModel

from backend.database.database import User
from backend.database.prediction_history_queries import (get_prediction_history_size,
                                                         add_prediction_history, get_prediction_history)
from backend.models.account_models import AccountDataResponse, PasswordResetRequest
from backend.utils.auth.auth import update_password
from backend.utils.auth.auth_users import get_authenticated_user, get_current_active_user

# Create router for this class to be referenced by main.
router = APIRouter()


class PredictionHistoryPayload(BaseModel):
    """
    A base model representing a prediction string to be added for a user.
    """
    prediction_string: str


class PredictionHistoryResponse(BaseModel):
    """
    A base model for a response to the prediction history request.
    """
    prediction_string: str
    created_at: datetime


@router.post('/account/add-prediction')
async def add_prediction(data: PredictionHistoryPayload, user: User = Depends(get_current_active_user)):
    """
    Endpoint to add prediction to history
    """
    add_prediction_history(data.prediction_string, user.id)

    return {"message": "Prediction added"}


@router.get('/account/get-predictions')
async def get_prediction(user: User = Depends(get_current_active_user)):
    """
    Endpoint to get a list of prediction histories for a user.
    """
    history = get_prediction_history(user.id, 10)

    return history


@router.get('/account/info')
async def info_user(user: User = Depends(get_current_active_user)) -> AccountDataResponse:
    """
    Endpoint to get the current user information.
    """
    prediction_history_size = get_prediction_history_size(user.email)

    return AccountDataResponse(username=user.username, email=user.email,
                               total_predictions=user.total_predictions,
                               prediction_history_size=prediction_history_size, last_login=user.last_login,
                               creation_date=user.created_at)


@router.post('/account/change-password')
async def reset_password(data: PasswordResetRequest,
                         user: User = Depends(get_current_active_user)):
    """
    Endpoint to handle password reset requests.
    """
    # Attempt to authenticate the user with current password before
    user = get_authenticated_user(user.username, data.current_password)

    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Your current password is incorrect",
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
