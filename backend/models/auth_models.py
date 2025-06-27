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


class RegisterRequest(BaseModel):
    """
    A model that represents data received for a registration request.
    """
    username: str
    email: str
    password: str
