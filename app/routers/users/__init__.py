from fastapi.routing import APIRouter
from .users import users_router

users_router = APIRouter(prefix='/users')
