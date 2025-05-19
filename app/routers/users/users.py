from fastapi import Request
from fastapi.routing import APIRouter

users_router = APIRouter()


@users_router.get('/profile')
async def get_profile(request: Request):
    return {"message": "User profile"}
