from datetime import datetime, timedelta, timezone

from jose import jwt
from passlib.context import CryptContext
from sqlmodel import Session, select

from app.models import User
from common import get_settings

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(password: str, hashed: str) -> bool:
    return pwd_context.verify(password, hashed)


def create_token(username: str, role: str) -> str:
    payload = {"sub": username, "role": role, "exp": datetime.now(timezone.utc) + timedelta(hours=6)}
    return jwt.encode(payload, get_settings().jwt_secret, algorithm="HS256")


def authenticate(session: Session, username: str, password: str) -> User | None:
    user = session.exec(select(User).where(User.username == username)).first()
    if not user:
        return None
    if not verify_password(password, user.password_hash):
        return None
    return user
