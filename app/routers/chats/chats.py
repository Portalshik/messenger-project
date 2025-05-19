from fastapi import Request
from fastapi.routing import APIRouter

chats_router = APIRouter()


@chats_router.get('/list')
async def get_chats(request: Request):
    return {"message": "List of chats"}
