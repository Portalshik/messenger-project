from sqlalchemy import Column, Integer, String, Text, Boolean, ForeignKey, BigInteger, TIMESTAMP
from sqlalchemy.orm import relationship, declarative_base
from .db import Base


class User(Base):
    __tablename__ = 'users'
    id = Column(Integer, primary_key=True)
    username = Column(String(50), unique=True, nullable=False)
    hashed_password = Column(Text, nullable=False)
    full_name = Column(String(100))
    active = Column(Boolean, default=True)
    created_at = Column(TIMESTAMP(timezone=True))

    albums = relationship('Album', back_populates='owner')
    messages = relationship('Message', back_populates='sender')
    chats_admin = relationship(
        'Chat',
        back_populates='admin',
        foreign_keys='Chat.admin_id')
    chats = relationship('RelUsersToChat', back_populates='user')


class Album(Base):
    __tablename__ = 'albums'
    id = Column(Integer, primary_key=True)
    owner_id = Column(Integer, ForeignKey('users.id'))
    created_at = Column(TIMESTAMP(timezone=True))

    owner = relationship('User', back_populates='albums')
    media = relationship('Media', back_populates='album')
    messages = relationship('Message', back_populates='album')


class Filetype(Base):
    __tablename__ = 'filetypes'
    id = Column(Integer, primary_key=True)
    typename = Column(String(55), unique=True, nullable=False)
    media = relationship('Media', back_populates='filetype')


class Media(Base):
    __tablename__ = 'media'
    id = Column(Integer, primary_key=True)
    path = Column(String)
    filename = Column(String(256))
    filetype_id = Column(Integer, ForeignKey('filetypes.id'))
    album_id = Column(Integer, ForeignKey('albums.id'))
    uploaded_at = Column(TIMESTAMP(timezone=True))

    filetype = relationship('Filetype', back_populates='media')
    album = relationship('Album', back_populates='media')


class Chat(Base):
    __tablename__ = 'chats'
    id = Column(BigInteger, primary_key=True)
    name = Column(String(256))
    is_group = Column(Boolean, default=False)
    admin_id = Column(Integer, ForeignKey('users.id'))

    admin = relationship('User', back_populates='chats_admin')
    messages = relationship('Message', back_populates='chat')
    users = relationship('RelUsersToChat', back_populates='chat')


class Message(Base):
    __tablename__ = 'messages'
    id = Column(Integer, primary_key=True)
    chat_id = Column(BigInteger, ForeignKey('chats.id'))
    sender_id = Column(Integer, ForeignKey('users.id'))
    content = Column(Text)
    album_id = Column(Integer, ForeignKey('albums.id'))
    sended_at = Column(TIMESTAMP(timezone=True))

    chat = relationship('Chat', back_populates='messages')
    sender = relationship('User', back_populates='messages')
    album = relationship('Album', back_populates='messages')


class RelUsersToChat(Base):
    __tablename__ = 'rel_users_to_chat'
    user_id = Column(Integer, ForeignKey('users.id'), primary_key=True)
    chat_id = Column(BigInteger, ForeignKey('chats.id'), primary_key=True)

    user = relationship('User', back_populates='chats')
    chat = relationship('Chat', back_populates='users')
