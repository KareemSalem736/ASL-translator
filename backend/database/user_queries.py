"""
Module containing functions to perform user queries on the database.
"""
from datetime import datetime

from sqlmodel import Session, select

from backend.database.database import engine, User


def get_user_username(username):
    """
    Get a user based on their username.
    """
    with Session(engine) as session:
        statement = select(User)
        # Determine if user exists and then return the first user.
        if username is not None:
            statement = statement.where(User.username == username)
            user = session.exec(statement).first()
            return user
        return None


def get_user_email(email):
    """
    Get a user based on their email.
    """
    with Session(engine) as session:
        statement = select(User)
        # Determine if user exists and then return the first user.
        if email is not None:
            statement = statement.where(User.email == email)
            user = session.exec(statement).first()
            return user
        return None


def database_create_user(username: str, email: str, password: str):
    """
    Create a user in the database with the supplied username, email, and hashed password.
    """
    with Session(engine) as session:
        session.add(User(username=username, email=email,
                password_hashed=password, created_at=datetime.now()))
        session.commit()


def database_update_password(email, password_hashed):
    """
    Updated the password for the supplied email's user.
    """
    with Session(engine) as session:
        user = get_user_email(email)
        user.password_hashed = password_hashed
        session.add(user)
        session.commit()
        session.refresh(user)
        return user
