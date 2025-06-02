from fastapi import Request, APIRouter, Depends, Query, HTTPException, UploadFile, File
from fastapi.routing import APIRouter
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from typing import List
import os
import shutil
from datetime import datetime

from utils.db import get_db
from utils.models import User, Message, Chat, Media, RelUsersToChat
from utils.auth import get_current_user
from utils.schemas import UserResponse, UserUpdate
from utils.paths import UPLOADS_DIR

users_router = APIRouter()


@users_router.get('/profile', response_model=UserResponse)
async def get_profile(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    return current_user


@users_router.get('/search')
async def search_users(
    query: str = Query(..., min_length=1),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(User).where(User.username.ilike(f"%{query}%"))
    )
    users = result.scalars().all()
    return [
        {"id": user.id, "username": user.username, "email": user.email}
        for user in users
    ]


@users_router.get("/stats")
async def get_user_stats(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # Получаем количество сообщений пользователя
    messages_count = await db.execute(
        select(func.count(Message.id))
        .where(Message.sender_id == current_user.id)
    )
    total_messages = messages_count.scalar_one()

    # Получаем количество чатов пользователя
    chats_count = await db.execute(
        select(func.count(Chat.id))
        .join(RelUsersToChat, Chat.id == RelUsersToChat.chat_id)
        .where(RelUsersToChat.user_id == current_user.id)
    )
    total_chats = chats_count.scalar_one()

    # Получаем количество медиафайлов пользователя
    media_count = await db.execute(
        select(func.count(Media.id))
        .join(Message, Media.album_id == Message.album_id)
        .where(Message.sender_id == current_user.id)
    )
    total_media = media_count.scalar_one()

    return {
        "totalMessages": total_messages,
        "totalChats": total_chats,
        "totalMedia": total_media
    }


@users_router.get('/{user_id}', response_model=UserResponse)
async def get_user_by_id(user_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="Пользователь не найден")
    return user


@users_router.put('/profile', response_model=UserResponse)
async def update_profile(
    username: str = None,
    email: str = None,
    full_name: str = None,
    avatar: UploadFile = File(None),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    updated = False
    if username:
        current_user.username = username
        updated = True
    if email:
        current_user.email = email
        updated = True
    if full_name:
        if hasattr(current_user, 'full_name'):
            current_user.full_name = full_name
            updated = True
    if avatar:
        # Проверяем тип файла
        if not avatar.content_type.startswith('image/'):
            raise HTTPException(
                status_code=400,
                detail="Файл должен быть изображением")

        # Проверяем размер файла (5MB)
        if avatar.size > 5 * 1024 * 1024:
            raise HTTPException(status_code=400,
                                detail="Размер файла не должен превышать 5MB")

        # Создаем директорию для аватаров, если её нет
        avatar_dir = os.path.join(UPLOADS_DIR, 'avatars')
        os.makedirs(avatar_dir, exist_ok=True)

        # Генерируем уникальное имя файла
        file_extension = os.path.splitext(avatar.filename)[1]
        avatar_filename = f'''user_{
            current_user.id}_{
            int(
                datetime.now().timestamp())}{file_extension}'''
        avatar_path = os.path.join(avatar_dir, avatar_filename)

        # Сохраняем файл
        with open(avatar_path, 'wb') as f:
            shutil.copyfileobj(avatar.file, f)

        # Обновляем путь к аватару в базе данных
        current_user.avatar = f'/uploads/avatars/{avatar_filename}'
        updated = True

    if updated:
        await db.commit()
        await db.refresh(current_user)

    return current_user
