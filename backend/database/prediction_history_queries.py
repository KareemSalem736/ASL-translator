"""
Module containing functions to perform prediction history queries on the database.
"""
from datetime import datetime, timezone

from sqlmodel import Session, select, func

from backend.database.database import engine, User, PredictionHistory


def add_prediction_history(prediction_string: str, user_id: int):
    """
    Add prediction history for a user.
    """
    with Session(engine) as session:
        session.add(PredictionHistory(user_id=user_id, content=prediction_string,
                                      created_at=datetime.now(timezone.utc)))
        session.commit()


def get_prediction_history(user_id: int, total: int):
    """
    Get a number of the most recent prediction history for a user.
    """
    with (Session(engine) as session):
        statement = (select(PredictionHistory)
                     .where(PredictionHistory.user_id == user_id)
                     .order_by(PredictionHistory.created_at.desc())).limit(total)
        results = session.exec(statement).all()
        return results


def get_prediction_history_size(email: str) -> int:
    """
    Get size of prediction history queries.
    """
    with Session(engine) as session:
        statement = select(func.count(PredictionHistory.user_id)).join(User).where(User.email == email)
        history_count = session.scalar(statement)
        return history_count
