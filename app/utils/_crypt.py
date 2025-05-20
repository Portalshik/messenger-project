from passlib.context import CryptContext
import jwt
from .cfg import SECRET_KEY, ALGORITHM
from datetime import datetime, timedelta


pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


def generate_access_token(user_id: int) -> str:
    """Генерирует access token со сроком действия 15 минут"""
    expire = datetime.now() + timedelta(minutes=15)
    return jwt.encode(
        {
            "user_id": user_id,
            "exp": expire,
            "type": "access"
        },
        SECRET_KEY,
        algorithm=ALGORITHM
    )


def generate_refresh_token(user_id: int) -> str:
    """Генерирует refresh token со сроком действия 7 дней"""
    expire = datetime.now() + timedelta(days=7)
    return jwt.encode(
        {
            "user_id": user_id,
            "exp": expire,
            "type": "refresh"
        },
        SECRET_KEY,
        algorithm=ALGORITHM
    )


def decode_token(token: str) -> dict:
    """Декодирует токен и проверяет его тип"""
    payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    if "type" not in payload:
        raise jwt.InvalidTokenError("Token type not specified")
    return payload


def verify_token_type(token: str, expected_type: str) -> bool:
    """Проверяет тип токена"""
    try:
        payload = decode_token(token)
        return payload.get("type") == expected_type
    except jwt.InvalidTokenError:
        return False
