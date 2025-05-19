from fastapi import FastAPI
from routers.auth.auth import auth_router
from routers.registration.registration import registration_router
from routers.chats.chats import chats_router
from routers.users.users import users_router

app = FastAPI()


@app.get('/status')
async def status():
    return 'ok'

app.include_router(auth_router, prefix='/auth')
app.include_router(registration_router, prefix='/registration')
app.include_router(chats_router, prefix='/chat')
app.include_router(users_router, prefix='/user')
