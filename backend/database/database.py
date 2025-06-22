"""
This file is currently a work in progress.
"""
from datetime import datetime, timezone

from sqlmodel import SQLModel, create_engine, Field


class User(SQLModel, table=True):
    id: int | None = Field(primary_key=True)
    username: str = Field(max_length=50)
    email: str = Field(max_length=50)
    password_hashed: str = Field(max_length=50)
    is_active: bool = Field(default=True)
    created_at: datetime = Field(default=datetime.now(timezone.utc))


class PredictionHistory(SQLModel, table=True):
    id: int | None = Field(primary_key=True)
    content: str = Field(max_length=1000)
    created_at: datetime = Field(default=datetime.now(timezone.utc))
    user_id: int | None = Field(default=None, foreign_key="user.id")


engine = create_engine("sqlite:///database.db")

SQLModel.metadata.create_all(engine)
