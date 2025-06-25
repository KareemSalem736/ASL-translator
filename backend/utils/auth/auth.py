"""
Utility functions for performing actions with authentication.
"""
import bcrypt
from fastapi.security import OAuth2PasswordBearer

from ...configs.config import get_config
from ...database.database import User
from ...database.user_queries import database_update_password

# constant variables pulled from config
SECRET_ACCESS = get_config().get("AUTH", "secret_access")
SECRET_REFRESH = get_config().get("AUTH", "secret_refresh")
ALGORITHM = get_config().get("AUTH", "algorithm")
TOKEN_ACCESS_EXPIRATION = int(get_config().get("AUTH", "refresh_token_expire_days"))
TOKEN_REFRESH_EXPIRATION = int(get_config().get("AUTH", "access_token_expire_minutes"))

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")


def get_password_hash(password: str) -> str:
    """
    Get a hash of a password.
    """
    pwd_bytes = password.encode("utf-8")
    hashed_password = bcrypt.hashpw(pwd_bytes, bcrypt.gensalt()).decode("utf-8")
    return hashed_password


def verify_password(plain_password: str, hashed_password: bytes) -> bool:
    """
    Verify a password against a hashed password.
    """
    password_bytes = plain_password.encode("utf-8")
    return bcrypt.checkpw(password_bytes, hashed_password)


def update_password(email: str, new_password: str) -> User:
    """
    Update the password of the specified user.
    """
    user = database_update_password(email, get_password_hash(new_password))
    return user
