import asyncio
from sqlalchemy.ext.asyncio import create_async_engine
from utils.db import Base
from utils.models import User, Album, Filetype, Media, Chat, Message, RelUsersToChat


async def recreate_tables():
    # Создаем движок с теми же параметрами, что и в db.py
    engine = create_async_engine(
        'postgresql+asyncpg://postgres:postgres@localhost/messenger',
        echo=True)

    # Удаляем все таблицы
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)

    # Создаем таблицы заново
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    await engine.dispose()

if __name__ == "__main__":
    asyncio.run(recreate_tables())
