from sqlmodel import Session, select

from backend.database.database import engine, User


def get_user_username(username):
    with Session(engine) as session:
        statement = select(User)
        if username is not None:
            statement = statement.where(User.username == username)
            user = session.exec(statement).first()
            return user
        return None


def get_user_email(email):
    with Session(engine) as session:
        statement = select(User)
        if email is not None:
            statement = statement.where(User.email == email)
            user = session.exec(statement).first()
            return user
        return None


def database_create_user(username, email, password_hashed):
    with Session(engine) as session:
        session.add(User(username=username, email=email, password_hashed=password_hashed))
        session.commit()


def update_password(email, password_hashed):
    with Session(engine) as session:
        user = get_user_email(email)
        user.password_hashed = password_hashed
        session.add(user)
        session.commit()
        session.refresh(user)
        return user
