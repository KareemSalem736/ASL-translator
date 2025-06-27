"""
Module containing functions to perform prediction history queries on the database.
"""
from datetime import datetime

from sqlmodel import Session, select, func

from backend.database.database import engine, User, PredictionHistory


def add_prediction_history(prediction_string: str, user_id: int):
    """
    Add prediction history for a user.
    """
    with Session(engine) as session:
        session.add(PredictionHistory(user_id=user_id, content=prediction_string, created_at=datetime.now()))
        session.commit()


def get_prediction_history_size(email: str) -> int:
    """
    Get size of prediction history queries.
    """
    with Session(engine) as session:
        statement = select(func.count(PredictionHistory.user_id)).join(User).where(User.email == email)
        history_count = session.scalar(statement)
        return history_count
