"""
Module containing BaseModels for authentication endpoints.
"""
from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class Token(BaseModel):
    """
    A model that represents a token to be sent to the user.
    """
    username: str
    access_token: str
    token_type: str


class TokenData(BaseModel):
    """
    A model representing the data in a token.
    """
    username: Optional[str] = None


class UserDataResponse(BaseModel):
    """
    A model representing current user's date.
    """
    username: str
    email: str
    total_predictions: int
    prediction_history_size: int
    last_login: datetime
    creation_date: datetime


class RegisterRequest(BaseModel):
    """
    A model that represents data received for a registration request.
    """
    username: str
    email: str
    password: str


class PasswordResetRequest(BaseModel):
    """
    A model that represents data received for a password reset request.
    """
    current_password: str
    new_password: str
