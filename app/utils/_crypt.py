from passlib.context import CryptContext
import jwt
from .cfg import SECRET_KEY, ALGORITHM
from datetime import datetime, timedelta


pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


def generate_token(user_id: int) -> str:
    expire = datetime.now() + timedelta(days=3)
    return jwt.encode(
        {"user_id": user_id, "exp": str(expire)},
        SECRET_KEY,
        algorithm=ALGORITHM
    )


def decode_token(token: str) -> int:
    return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
