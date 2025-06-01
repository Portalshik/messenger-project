import sqlalchemy
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()

engine = create_async_engine(
    'postgresql+asyncpg://postgres:postgres@192.168.1.5/messenger', echo=True)

async_session = sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False)


async def get_db():
    async with async_session() as session:
        try:
            yield session
        finally:
            await session.close()
