from fastapi import Request, Depends, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.routing import APIRouter
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
from sqlalchemy import select
import logging
import os
import jwt

from utils.db import get_db
from utils.models import RelUsersToChat, Chat, Message, User, Media, Album
from utils.auth import oauth2_scheme
from utils.schemas import MessageCreate, MessageResponse, ChatCreate, ChatResponse
from utils.auth import get_current_user
from utils.cfg import SECRET_KEY, ALGORITHM

# Создаём директорию для логов, если её нет
os.makedirs("logs", exist_ok=True)

logging.basicConfig(
    filename="logs/messenger.log",
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s"
)
logger = logging.getLogger(__name__)

chats_router = APIRouter()


@chats_router.get('/list', response_model=List[ChatResponse])
async def get_chats(
    request: Request,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(Chat)
        .join(RelUsersToChat, Chat.id == RelUsersToChat.chat_id)
        .where(RelUsersToChat.user_id == current_user.id)
    )
    chats = result.scalars().all()
    response = []
    for chat in chats:
        chat_dict = chat.__dict__.copy()
        if not chat.is_group:
            rels_result = await db.execute(
                select(RelUsersToChat).where(RelUsersToChat.chat_id == chat.id)
            )
            rels = rels_result.scalars().all()
            user_ids = [
                rel.user_id for rel in rels if rel.user_id != current_user.id]
            if user_ids:
                user_result = await db.execute(select(User).where(User.id == user_ids[0]))
                other_user = user_result.scalar_one_or_none()
                if other_user:
                    chat_dict['name'] = other_user.email or other_user.username
        response.append(chat_dict)
    return response


@chats_router.post("/create", response_model=ChatResponse)
async def create_chat(
    chat: ChatCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    db_chat = Chat(
        name=chat.name,
        is_group=chat.is_group,
        admin_id=current_user.id
    )
    db.add(db_chat)
    await db.commit()
    await db.refresh(db_chat)

    # Добавляем создателя в чат
    rel = RelUsersToChat(user_id=current_user.id, chat_id=db_chat.id)
    db.add(rel)
    await db.commit()

    return db_chat


@chats_router.post("/{chat_id}/add_user/{user_id}")
async def add_user_to_chat(
    chat_id: int,
    user_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(Chat).where(Chat.id == chat_id))
    chat = result.scalar_one_or_none()
    if not chat:
        raise HTTPException(status_code=404, detail="Чат не найден")
    if chat.admin_id != current_user.id:
        raise HTTPException(
            status_code=403,
            detail="Только администратор может добавлять пользователей")
    if not chat.is_group:
        # Проверяем, сколько уже участников
        result = await db.execute(select(RelUsersToChat).where(RelUsersToChat.chat_id == chat_id))
        users_in_chat = result.scalars().all()
        if len(users_in_chat) >= 2:
            raise HTTPException(
                status_code=400,
                detail="В личном чате может быть только 2 участника")
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="Пользователь не найден")
    rel = RelUsersToChat(user_id=user_id, chat_id=chat_id)
    db.add(rel)
    await db.commit()
    return {"message": "Пользователь успешно добавлен в чат"}


@chats_router.post("/{chat_id}/send", response_model=MessageResponse)
async def send_message(
    chat_id: int,
    message: MessageCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    logger.info(
        f"Received message: content={
            message.content}, album_id={
            message.album_id}")

    result = await db.execute(select(Chat).where(Chat.id == chat_id))
    chat = result.scalar_one_or_none()
    if not chat:
        raise HTTPException(status_code=404, detail="Чат не найден")

    result = await db.execute(select(RelUsersToChat).where(
        RelUsersToChat.chat_id == chat_id,
        RelUsersToChat.user_id == current_user.id
    ))
    rel = result.scalar_one_or_none()
    if not rel:
        raise HTTPException(status_code=403,
                            detail="У вас нет доступа к этому чату")

    # Проверяем существование альбома и медиа
    media_paths = []
    if message.album_id:
        logger.info(f"Checking album {message.album_id}")
        album_result = await db.execute(select(Album).where(Album.id == message.album_id))
        album = album_result.scalar_one_or_none()
        if not album:
            logger.error(f"Album {message.album_id} not found")
            raise HTTPException(status_code=404, detail="Альбом не найден")

        media_result = await db.execute(select(Media).where(Media.album_id == message.album_id))
        media_list = media_result.scalars().all()
        if not media_list:
            logger.error(f"No media found in album {message.album_id}")
            raise HTTPException(
                status_code=404,
                detail="Медиа не найдено в альбоме")
        logger.info(f"Found {len(media_list)} media in album")
        media_paths = [
            f"/uploads/{media.filename.replace('\\', '/')}" for media in media_list]

    try:
        db_message = Message(
            content=message.content,
            chat_id=chat_id,
            sender_id=current_user.id,
            album_id=message.album_id,
            sended_at=datetime.utcnow()
        )
        db.add(db_message)
        await db.commit()
        await db.refresh(db_message)
        logger.info(f"Message saved with album_id: {db_message.album_id}")

        # Получаем всех пользователей в чате
        result = await db.execute(select(RelUsersToChat).where(RelUsersToChat.chat_id == chat_id))
        chat_users = result.scalars().all()

        # Получаем информацию о медиа и отправителе
        sender_result = await db.execute(select(User).where(User.id == db_message.sender_id))
        sender = sender_result.scalar_one_or_none()
        sender_name = sender.username if sender else "Unknown"

        # Формируем сообщение для отправки
        message_data = {
            **db_message.__dict__,
            "media_paths": media_paths,
            "sender_name": sender_name
        }

        # Отправляем сообщение всем пользователям в чате
        for chat_user in chat_users:
            if chat_user.user_id in active_connections:
                try:
                    await active_connections[chat_user.user_id].send_json(message_data)
                except Exception as e:
                    logger.error(
                        f"Error sending message to user {
                            chat_user.user_id}: {
                            str(e)}")

        return message_data
    except Exception as e:
        logger.error(f"Error saving message: {str(e)}")
        await db.rollback()
        raise HTTPException(
            status_code=500,
            detail=f"Ошибка при сохранении сообщения: {str(e)}")


@chats_router.get("/{chat_id}/messages", response_model=List[MessageResponse])
async def get_messages(
    chat_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(RelUsersToChat).where(
        RelUsersToChat.chat_id == chat_id,
        RelUsersToChat.user_id == current_user.id
    ))
    rel = result.scalar_one_or_none()
    if not rel:
        raise HTTPException(status_code=403,
                            detail="У вас нет доступа к этому чату")
    result = await db.execute(select(Message).where(
        Message.chat_id == chat_id
    ).order_by(Message.sended_at))
    messages = result.scalars().all()
    response = []
    for msg in messages:
        media_paths = []
        if msg.album_id:
            media_result = await db.execute(select(Media).where(Media.album_id == msg.album_id))
            media_list = media_result.scalars().all()
            media_paths = [
                f"/uploads/{media.filename.replace('\\', '/')}" for media in media_list]
        print(f"msg.id={msg.id}, album_id={msg.album_id}")
        print(f"media_paths: {media_paths}")
        # Получаем имя отправителя
        sender_result = await db.execute(select(User).where(User.id == msg.sender_id))
        sender = sender_result.scalar_one_or_none()
        sender_name = sender.username if sender else "Unknown"
        response.append({
            **msg.__dict__,
            "media_paths": media_paths,
            "sender_name": sender_name
        })
    return response
