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
from dotenv import load_dotenv
import json
import sqladmin

# Загружаем переменные окружения
load_dotenv()

app = FastAPI()

# Инициализация административной панели
init_admin(app)

# Получаем список разрешенных origins из переменной окружения
CORS_ORIGINS = json.loads(
    os.getenv(
        "CORS_ORIGINS",
        '["https://messenger-project-eight.vercel.app"]'))

# Настройка CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Создаем директорию для загрузок, если её нет
os.makedirs(UPLOADS_DIR, exist_ok=True)

# Принудительно монтируем статику sqladmin
sqladmin_static_path = os.path.join(
    os.path.dirname(sqladmin.__file__), "static")
app.mount(
    "/static/sqladmin",
    StaticFiles(
        directory=sqladmin_static_path),
    name="sqladmin-static")


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
