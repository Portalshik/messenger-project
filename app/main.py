from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers.auth.auth import auth_router
from routers.registration.registration import registration_router
from routers.chats.chats import chats_router
from routers.users.users import users_router
from routers.media.media import media_router
from fastapi.staticfiles import StaticFiles
import os
from utils.paths import UPLOADS_DIR

app = FastAPI()

# Настройка CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://0.0.0.0:3000"
    ],
    # Указываем адрес фронта
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
    max_age=3600,
)

# Раздача статики для медиа-файлов
app.mount(
    "/uploads",
    StaticFiles(directory=UPLOADS_DIR),
    name="uploads"
)


@app.get('/status')
async def status():
    return 'ok'

app.include_router(auth_router, prefix='/api/auth', tags=['auth'])
app.include_router(
    registration_router,
    prefix='/api/registration',
    tags=['registration'])
app.include_router(chats_router, prefix='/api/chat', tags=['chats'])
app.include_router(users_router, prefix='/api/user', tags=['users'])
app.include_router(media_router, prefix='/api/media', tags=['media'])
