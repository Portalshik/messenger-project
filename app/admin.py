from sqladmin import Admin, ModelView
from sqlalchemy.ext.asyncio import AsyncSession
from utils.models import User, Album, Filetype, Media, Chat, Message, RelUsersToChat
from utils.db import engine
from fastapi import FastAPI
from utils.auth import get_current_user
from fastapi import Depends


class UserAdmin(ModelView, model=User):
    column_list = [
        User.id,
        User.username,
        User.email,
        User.active,
        User.created_at]
    column_searchable_list = [User.username, User.email]
    column_sortable_list = [
        User.id,
        User.username,
        User.email,
        User.active,
        User.created_at]
    can_create = True
    can_edit = True
    can_delete = True
    can_view_details = True


class AlbumAdmin(ModelView, model=Album):
    column_list = [Album.id, Album.owner_id, Album.created_at]
    column_searchable_list = [Album.owner_id]
    column_sortable_list = [Album.id, Album.owner_id, Album.created_at]
    can_create = True
    can_edit = True
    can_delete = True
    can_view_details = True


class FiletypeAdmin(ModelView, model=Filetype):
    column_list = [Filetype.id, Filetype.typename]
    column_searchable_list = [Filetype.typename]
    column_sortable_list = [Filetype.id, Filetype.typename]
    can_create = True
    can_edit = True
    can_delete = True
    can_view_details = True


class MediaAdmin(ModelView, model=Media):
    column_list = [
        Media.id,
        Media.path,
        Media.filename,
        Media.filetype_id,
        Media.album_id,
        Media.uploaded_at]
    column_searchable_list = [Media.filename]
    column_sortable_list = [Media.id, Media.filename, Media.uploaded_at]
    can_create = True
    can_edit = True
    can_delete = True
    can_view_details = True


class ChatAdmin(ModelView, model=Chat):
    column_list = [Chat.id, Chat.name, Chat.is_group, Chat.admin_id]
    column_searchable_list = [Chat.name]
    column_sortable_list = [Chat.id, Chat.name, Chat.is_group]
    can_create = True
    can_edit = True
    can_delete = True
    can_view_details = True


class MessageAdmin(ModelView, model=Message):
    column_list = [
        Message.id,
        Message.chat_id,
        Message.sender_id,
        Message.content,
        Message.album_id,
        Message.sended_at]
    column_searchable_list = [Message.content]
    column_sortable_list = [Message.id, Message.sended_at]
    can_create = True
    can_edit = True
    can_delete = True
    can_view_details = True


class RelUsersToChatAdmin(ModelView, model=RelUsersToChat):
    column_list = [RelUsersToChat.user_id, RelUsersToChat.chat_id]
    column_searchable_list = [RelUsersToChat.user_id, RelUsersToChat.chat_id]
    column_sortable_list = [RelUsersToChat.user_id, RelUsersToChat.chat_id]
    can_create = True
    can_edit = True
    can_delete = True
    can_view_details = True


def init_admin(app: FastAPI):
    admin = Admin(app, engine)

    # Добавляем все модели в админку
    admin.add_view(UserAdmin)
    admin.add_view(AlbumAdmin)
    admin.add_view(FiletypeAdmin)
    admin.add_view(MediaAdmin)
    admin.add_view(ChatAdmin)
    admin.add_view(MessageAdmin)
    admin.add_view(RelUsersToChatAdmin)
