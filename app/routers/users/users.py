from fastapi import Request, APIRouter, Depends, Query
from fastapi.routing import APIRouter
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from utils.db import get_db
from utils.models import User

users_router = APIRouter()


@users_router.get('/profile')
async def get_profile(request: Request):
    return {"message": "User profile"}

@users_router.get('/search')
async def search_users(
    query: str = Query(..., min_length=1),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(User).where(User.username.ilike(f"%{query}%"))
    )
    users = result.scalars().all()
    return [
        {"id": user.id, "username": user.username, "full_name": user.full_name}
        for user in users
    ]
