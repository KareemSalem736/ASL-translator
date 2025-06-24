"""
Module containing functions to perform prediction history queries on the database.
"""
from sqlmodel import Session, select, func

from backend.database.database import engine, User, PredictionHistory


def get_prediction_history_size(email: str) -> int:
    """
    Get size of prediction history queries.
    """
    with Session(engine) as session:
        statement = select(func.count(PredictionHistory.user_id)).join(User).where(User.email == email)
        history_count = session.scalar(statement)
        return history_count
