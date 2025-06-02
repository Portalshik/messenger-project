from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
import os
from datetime import datetime
from sqlalchemy import select
import logging
from urllib.parse import unquote

from utils.db import get_db
from utils.models import Album, Media, Filetype, User
from utils.schemas import MediaCreate, MediaResponse, AlbumSchema
from utils.auth import get_current_user
from utils.paths import UPLOADS_DIR

media_router = APIRouter()

logger = logging.getLogger(__name__)


@media_router.post("/albums", response_model=AlbumSchema)
async def create_album(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Создание нового альбома для пользователя"""
    try:
        album = Album(
            owner_id=current_user.id,
            created_at=datetime.utcnow()
        )
        db.add(album)
        await db.commit()
        await db.refresh(album)
        logger.info(
            f"""Created album with ID: {
                album.id} for user {
                current_user.id}""")
        return album
    except Exception as e:
        logger.error(f"""Error creating album: {
            str(e)}""")
        await db.rollback()
        raise HTTPException(
            status_code=500,
            detail=f"""Ошибка при создании альбома: {
                str(e)}""")


@media_router.get("/albums", response_model=List[AlbumSchema])
async def get_user_albums(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Получение всех альбомов пользователя"""
    result = await db.execute(select(Album).where(Album.owner_id == current_user.id))
    return result.scalars().all()


@media_router.post("/upload/{album_id}", response_model=MediaResponse)
async def upload_media(
    album_id: int,
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Загрузка медиа-файла в альбом"""
    try:
        # Проверяем существование альбома и права доступа
        result = await db.execute(select(Album).where(Album.id == album_id))
        album = result.scalar_one_or_none()
        if not album:
            logger.error(f"Album {album_id} not found")
            raise HTTPException(status_code=404, detail="Альбом не найден")
        if album.owner_id != current_user.id:
            logger.error(
                f"""User {
                    current_user.id} has no access to album {album_id}""")
            raise HTTPException(
                status_code=403,
                detail="Нет доступа к этому альбому")

        # Определяем тип файла
        file_extension = os.path.splitext(file.filename)[1].lower()
        result = await db.execute(select(Filetype).where(Filetype.typename == file_extension))
        filetype = result.scalar_one_or_none()
        if not filetype:
            # Создаем новый тип файла, если его нет
            filetype = Filetype(typename=file_extension)
            db.add(filetype)
            await db.commit()
            await db.refresh(filetype)

        # Создаем уникальное имя файла
        timestamp = datetime.utcnow().strftime("%Y%m%d_%H%M%S")
        decoded_filename = unquote(file.filename)
        filename = f"{timestamp}_{decoded_filename}"
        file_path = os.path.join(UPLOADS_DIR, filename).replace('\\', '/')

        # Сохраняем файл
        try:
            contents = await file.read()
            with open(file_path, "wb") as f:
                f.write(contents)
            logger.info(f"File saved to {file_path}")
        except Exception as e:
            logger.error(f"Error saving file: {str(e)}")
            raise HTTPException(
                status_code=500,
                detail=f"""Ошибка при сохранении файла: {
                    str(e)}""")

        # Создаем запись в базе данных
        media = Media(
            path=f"/uploads/{filename}",
            filename=filename,
            filetype_id=filetype.id,
            album_id=album_id,
            uploaded_at=datetime.utcnow()
        )
        db.add(media)
        await db.commit()
        await db.refresh(media)
        logger.info(
            f"""Media record created with ID: {
                media.id} in album {album_id}""")
        return media
    except Exception as e:
        logger.error(f"Error in upload_media: {str(e)}")
        await db.rollback()
        raise HTTPException(
            status_code=500,
            detail=f"""Ошибка при загрузке медиа: {
                str(e)}""")


@media_router.get("/album/{album_id}", response_model=List[MediaResponse])
async def get_album_media(
    album_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Получение всех медиа-файлов из альбома"""
    result = await db.execute(select(Media).where(Media.album_id == album_id))
    media_list = result.scalars().all()
    for media in media_list:
        if media.path.startswith("/uploads/"):
            media.path = media.path
        else:
            media.path = f"/uploads/{media.filename}"
    return media_list


@media_router.delete("/media/{media_id}")
async def delete_media(
    media_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Удаление медиа-файла"""
    media = db.query(Media).filter(Media.id == media_id).first()
    if not media:
        raise HTTPException(status_code=404, detail="Медиа-файл не найден")

    # Проверяем права доступа через альбом
    album = db.query(Album).filter(Album.id == media.album_id).first()
    if album.owner_id != current_user.id:
        raise HTTPException(status_code=403,
                            detail="Нет прав на удаление этого файла")

    # Удаляем файл с диска
    try:
        if os.path.exists(media.path):
            os.remove(media.path)
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"""Ошибка при удалении файла: {
                str(e)}""")

    # Удаляем запись из базы данных
    db.delete(media)
    db.commit()

    return {"message": "Медиа-файл успешно удален"}


@media_router.get("", response_model=List[MediaResponse])
async def get_all_user_media(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Получение всех медиа-файлов пользователя"""
    result = await db.execute(select(Album).where(Album.owner_id == current_user.id))
    albums = result.scalars().all()
    all_media = []
    for album in albums:
        result = await db.execute(select(Media).where(Media.album_id == album.id))
        media_list = result.scalars().all()
        for media in media_list:
            # Исправляем путь, если он абсолютный
            if media.path.startswith("/uploads/"):
                media.path = media.path
            else:
                media.path = f"/uploads/{media.filename}"
        all_media.extend(media_list)
    return all_media
