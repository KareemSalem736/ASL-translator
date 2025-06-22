from typing import Annotated

from fastapi import APIRouter, Depends, status, HTTPException
from fastapi.security import OAuth2PasswordRequestForm
from pydantic import BaseModel

from backend.database.database import User
from backend.utils.auth import (create_access_token, get_authenticated_user, get_current_active_user,
                                check_user_exists, check_user_email_exists, create_user)

router = APIRouter()


class Token(BaseModel):
    username: str
    access_token: str
    token_type: str


class AuthRequest(BaseModel):
    identifier: str
    type: str
    password: str


class AuthResponse(BaseModel):
    username: str
    message: str
    access_token: str
    token_type: str


class RegisterRequest(BaseModel):
    username: str
    email: str
    password: str


@router.post('/auth/login')
async def login_user(form_data: Annotated[OAuth2PasswordRequestForm, Depends()]) -> Token:
    user = get_authenticated_user(form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"}
        )
    access_token = create_access_token(data={"sub": user.username})
    return Token(username=user.username, access_token=access_token, token_type="bearer")


@router.post('/auth/register')
async def register_user(register_data: RegisterRequest) -> Token:
    if check_user_exists(register_data.username):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already exists",
            headers={"WWW-Authenticate": "Bearer"}
        )

    if check_user_email_exists(register_data.email):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already exists",
            headers={"WWW-Authenticate": "Bearer"}
        )

    create_user(register_data.username, register_data.email, register_data.password)

    access_token = create_access_token(data={"sub": register_data.username})
    return Token(username=register_data.username, access_token=access_token, token_type="bearer")


@router.get("/auth/test", response_model=User)
async def test(current_user: Annotated[User, Depends(get_current_active_user)]):
    return current_user


@router.post('/auth/logout')
async def logout_user():
    return {"token": "test", "description": "test"}
