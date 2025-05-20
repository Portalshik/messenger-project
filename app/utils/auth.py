from fastapi import Request, HTTPException
from utils._crypt import decode_token
from datetime import datetime

def oauth2_scheme(request: Request):
    token = request.headers.get("Authorization").replace("Bearer ", "")
    data = decode_token(token)
    if data["exp"] < datetime.now().timestamp():
        raise HTTPException(status_code=401, detail="Token expired")
    return data
