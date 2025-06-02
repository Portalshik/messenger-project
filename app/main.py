from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from routers.auth.auth import auth_router
from routers.registration.registration import registration_router
from routers.chats.chats import chats_router
from routers.users.users import users_router
from routers.media.media import media_router
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import os
from utils.paths import UPLOADS_DIR
from admin import init_admin
from urllib.parse import unquote

app = FastAPI()

# Инициализация административной панели
init_admin(app)

# Настройка CORS
# ВАЖНО: если фронтенд работает с другого адреса, добавь его сюда!
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://192.168.1.5:3000"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Создаем директорию для загрузок, если её нет
os.makedirs(UPLOADS_DIR, exist_ok=True)


@app.get("/uploads/{filename:path}")
async def get_upload(filename: str):
    decoded_filename = unquote(filename)
    file_path = os.path.join(UPLOADS_DIR, decoded_filename)
    if os.path.exists(file_path):
        return FileResponse(file_path)
    raise HTTPException(status_code=404, detail="File not found")


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
