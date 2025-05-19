from fastapi.routing import APIRouter
from .chats import chats_router

chats_router = APIRouter(prefix='/chat')
