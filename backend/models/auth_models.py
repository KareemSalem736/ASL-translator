"""
Module containing BaseModels for authentication endpoints.
"""
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


class TokenVerification(BaseModel):
    """
    A model that represents a token to be verified.
    """
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


class PasswordResetRequest(BaseModel):
    """
    A model that represents data received for a password reset request.
    """
    current_password: str
    new_password: str
