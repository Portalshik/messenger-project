from fastapi import Request, HTTPException, Depends
from fastapi.routing import APIRouter
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from utils.db import get_db
from utils.models import User
from utils.schemas import LoginData, LoginResponse
from utils._crypt import verify_password, generate_access_token, generate_refresh_token, verify_token_type, decode_token
import jwt
from utils.auth import get_current_user

auth_router = APIRouter()


@auth_router.post('/login', response_model=LoginResponse)
async def login(
    request: Request,
    data: LoginData,
    db: AsyncSession = Depends(get_db)
):
    # Находим пользователя по username
    result = await db.execute(select(User).where(User.username == data.username))
    user = result.scalar_one_or_none()
    
    if not user:
        raise HTTPException(status_code=401, detail="Неверное имя пользователя или пароль")
    
    # Проверяем пароль
    if not verify_password(data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Неверное имя пользователя или пароль")
    
    # Генерируем токены
    access_token = generate_access_token(user.id)
    refresh_token = generate_refresh_token(user.id)
    
    return LoginResponse(
        access_token=access_token,
        refresh_token=refresh_token
    )


@auth_router.post('/refresh', response_model=LoginResponse)
async def refresh_token(
    request: Request,
    refresh_token: str,
    db: AsyncSession = Depends(get_db)
):
    # Проверяем, что это действительно refresh token
    if not verify_token_type(refresh_token, "refresh"):
        raise HTTPException(status_code=401, detail="Неверный refresh token")
    
    try:
        # Декодируем токен и получаем user_id
        payload = decode_token(refresh_token)
        user_id = payload["user_id"]
        
        # Проверяем существование пользователя
        result = await db.execute(select(User).where(User.id == user_id))
        user = result.scalar_one_or_none()
        
        if not user:
            raise HTTPException(status_code=401, detail="Пользователь не найден")
        
        # Генерируем новые токены
        new_access_token = generate_access_token(user.id)
        new_refresh_token = generate_refresh_token(user.id)
        
        return LoginResponse(
            access_token=new_access_token,
            refresh_token=new_refresh_token
        )
        
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Неверный refresh token")


@auth_router.get('/me')
async def get_me(current_user: User = Depends(get_current_user)):
    return current_user
