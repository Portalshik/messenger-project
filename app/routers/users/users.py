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
