from fastapi import Request, Depends
from fastapi.routing import APIRouter
from sqlalchemy.ext.asyncio import AsyncSession
from utils.db import get_db
from sqlalchemy import select
from utils.models import RelUsersToChat
from utils.auth import oauth2_scheme

chats_router = APIRouter()



@chats_router.get('/list')
async def get_chats(request: Request, token_data: str = Depends(oauth2_scheme), db: AsyncSession = Depends(get_db)):
    user_id = token_data.get("user_id")
    result = await db.execute(select(RelUsersToChat).where(RelUsersToChat.user_id == user_id))
    chats = result.scalars().all()
    return chats
