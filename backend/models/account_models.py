"""
Module containing BaseModels for account endpoints.
"""
from datetime import datetime

from pydantic import BaseModel


class AccountDataResponse(BaseModel):
    """
    A model representing current user's date.
    """
    username: str
    email: str
    total_predictions: int
    prediction_history_size: int
    last_login: datetime
    creation_date: datetime


class PasswordResetRequest(BaseModel):
    """
    A model that represents data received for a password reset request.
    """
    current_password: str
    new_password: str
