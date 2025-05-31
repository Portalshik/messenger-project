from sqlalchemy import Column, Integer, String, Text, Boolean, ForeignKey, BigInteger, TIMESTAMP
from sqlalchemy.orm import relationship, declarative_base
from utils.db import Base


class User(Base):
    __tablename__ = 'users'
    id = Column(Integer, primary_key=True)
    username = Column(String(50), unique=True, nullable=False)
    hashed_password = Column(Text, nullable=False)
    email = Column(String(100), unique=True, nullable=False)
    active = Column(Boolean, default=True)
    created_at = Column(TIMESTAMP(timezone=True))

    albums = relationship(
        'Album',
        back_populates='owner',
        cascade='all, delete-orphan')
    messages = relationship(
        'Message',
        back_populates='sender',
        cascade='all, delete-orphan')
    chats_admin = relationship(
        'Chat',
        back_populates='admin',
        foreign_keys='Chat.admin_id',
        cascade='all, delete-orphan')
    chats = relationship(
        'RelUsersToChat',
        back_populates='user',
        cascade='all, delete-orphan')


class Album(Base):
    __tablename__ = 'albums'
    id = Column(Integer, primary_key=True)
    owner_id = Column(Integer, ForeignKey('users.id', ondelete='CASCADE'))
    created_at = Column(TIMESTAMP(timezone=True))

    owner = relationship('User', back_populates='albums')
    media = relationship(
        'Media',
        back_populates='album',
        cascade='all, delete-orphan')
    messages = relationship(
        'Message',
        back_populates='album',
        cascade='all, delete-orphan')


class Filetype(Base):
    __tablename__ = 'filetypes'
    id = Column(Integer, primary_key=True)
    typename = Column(String(55), unique=True, nullable=False)
    media = relationship(
        'Media',
        back_populates='filetype',
        cascade='all, delete-orphan')


class Media(Base):
    __tablename__ = 'media'
    id = Column(Integer, primary_key=True)
    path = Column(String)
    filename = Column(String(256))
    filetype_id = Column(
        Integer,
        ForeignKey(
            'filetypes.id',
            ondelete='CASCADE'))
    album_id = Column(Integer, ForeignKey('albums.id', ondelete='CASCADE'))
    uploaded_at = Column(TIMESTAMP(timezone=True))

    filetype = relationship('Filetype', back_populates='media')
    album = relationship('Album', back_populates='media')


class Chat(Base):
    __tablename__ = 'chats'
    id = Column(BigInteger, primary_key=True)
    name = Column(String(256))
    is_group = Column(Boolean, default=False)
    admin_id = Column(Integer, ForeignKey('users.id', ondelete='CASCADE'))

    admin = relationship('User', back_populates='chats_admin')
    messages = relationship(
        'Message',
        back_populates='chat',
        cascade='all, delete-orphan')
    users = relationship(
        'RelUsersToChat',
        back_populates='chat',
        cascade='all, delete-orphan')


class Message(Base):
    __tablename__ = 'messages'
    id = Column(Integer, primary_key=True)
    chat_id = Column(BigInteger, ForeignKey('chats.id', ondelete='CASCADE'))
    sender_id = Column(Integer, ForeignKey('users.id', ondelete='CASCADE'))
    content = Column(Text)
    album_id = Column(Integer, ForeignKey('albums.id', ondelete='CASCADE'))
    sended_at = Column(TIMESTAMP(timezone=True))

    chat = relationship('Chat', back_populates='messages')
    sender = relationship('User', back_populates='messages')
    album = relationship('Album', back_populates='messages')


class RelUsersToChat(Base):
    __tablename__ = 'rel_users_to_chat'
    user_id = Column(
        Integer,
        ForeignKey(
            'users.id',
            ondelete='CASCADE'),
        primary_key=True)
    chat_id = Column(
        BigInteger,
        ForeignKey(
            'chats.id',
            ondelete='CASCADE'),
        primary_key=True)

    user = relationship('User', back_populates='chats')
    chat = relationship('Chat', back_populates='users')
