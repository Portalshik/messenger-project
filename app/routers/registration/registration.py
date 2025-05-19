from sqlalchemy import select
from utils.schemas import RegistrationRequest
from fastapi import Depends, HTTPException, Request
from fastapi.routing import APIRouter
from sqlalchemy.ext.asyncio import AsyncSession
from utils.db import get_db
from utils.models import User
from utils._crypt import hash_password, generate_token
import utils.models as models
registration_router = APIRouter()


@registration_router.post('/register')
async def register(
        request: Request,
        regData: RegistrationRequest,
        db: AsyncSession = Depends(get_db)):
    if regData.password != regData.confirm_password:
        raise HTTPException(status_code=400, detail="Passwords do not match")

    if not regData.full_name or not regData.password or not regData.confirm_password or not regData.username:
        raise HTTPException(status_code=400, detail="Missing required fields")

    result = await db.execute(select(User).where(User.username == regData.username))
    user = result.scalar_one_or_none()
    if user:
        raise HTTPException(
            status_code=400,
            detail="Пользователь с таким username уже существует")

    user = User(
        full_name=regData.full_name,
        username=regData.username,
        hashed_password=hash_password(regData.password),
        active=True
    )

    db.add(user)
    await db.commit()
    await db.refresh(user)

    return generate_token(user.id)
