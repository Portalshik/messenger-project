from fastapi import Request
from fastapi.routing import APIRouter

auth_router = APIRouter()


@auth_router.post('/login')
async def login(request: Request):
    return request.url.path
