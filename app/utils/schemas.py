from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional, List


class LoginRequest(BaseModel):
    email: str
    password: str


class RegistrationRequest(BaseModel):
    password: str
    confirm_password: str
    username: str
    email: str


class User(BaseModel):
    id: int
    email: str
    username: str


class LoginResponse(BaseModel):
    access_token: str
    refresh_token: str


class LoginData(BaseModel):
    username: str
    password: str


# Схемы для чатов
class ChatBase(BaseModel):
    name: Optional[str] = None
    is_group: bool = False


class ChatCreate(ChatBase):
    pass


class UserInfo(BaseModel):
    id: int
    username: str
    email: str
    avatar: Optional[str] = None

    class Config:
        from_attributes = True


class ChatResponse(ChatBase):
    id: int
    admin_id: int
    participants: List[UserInfo]

    class Config:
        from_attributes = True


# Схемы для сообщений
class MessageBase(BaseModel):
    content: str
    chat_id: int
    album_id: Optional[int] = None


class MessageCreate(MessageBase):
    pass


class MessageResponse(MessageBase):
    id: int
    sender_id: int
    sended_at: datetime
    media_path: Optional[str] = None
    sender_name: Optional[str] = None
    sender_avatar: Optional[str] = None
    media_paths: Optional[List[str]] = []

    class Config:
        from_attributes = True


# Схемы для медиа
class MediaBase(BaseModel):
    filename: str
    filetype_id: int
    album_id: Optional[int] = None


class MediaCreate(MediaBase):
    pass


class MediaResponse(MediaBase):
    id: int
    path: str
    uploaded_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class AlbumSchema(BaseModel):
    id: int
    owner_id: int
    created_at: datetime

    class Config:
        orm_mode = True


class UserResponse(BaseModel):
    id: int
    username: str
    email: str
    active: bool
    created_at: Optional[datetime] = None
    avatar: Optional[str] = None

    class Config:
        from_attributes = True


class UserUpdate(BaseModel):
    username: Optional[str] = None
    email: Optional[EmailStr] = None
    avatar: Optional[str] = None
