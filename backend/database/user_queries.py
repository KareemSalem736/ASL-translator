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
        # Determine if user exists and then return the first user.
        if username is not None:
            statement = select(User).where(User.username == username)
            user = session.exec(statement).first()
            return user
        return None


def get_user_email(email):
    """
    Get a user based on their email.
    """
    with Session(engine) as session:
        # Determine if user exists and then return the first user.
        if email is not None:
            statement = select(User).where(User.email == email)
            user = session.exec(statement).first()
            return user
        return None


def database_create_user(username: str, email: str, password: str):
    """
    Create a user in the database with the supplied username, email, and hashed password.
    """
    with Session(engine) as session:
        session.add(User(username=username, email=email,
                         password_hashed=password, created_at=datetime.now(), last_login=datetime.now()))
        session.commit()


def database_update_login_time(email: str):
    """
    Update the last login time for the user.
    """
    with Session(engine) as session:
        user = get_user_email(email)
        user.last_login = datetime.now()
        session.add(user)
        session.commit()
        session.refresh(user)


def database_update_password(email: str, password_hashed: str):
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


def database_increment_predict_count(email: str):
    """
    Increment the predict count for the supplied email.
    """
    with Session(engine) as session:
        user = get_user_email(email)
        user.total_predictions = user.total_predictions + 1
        session.add(user)
        session.commit()
        session.refresh(user)
