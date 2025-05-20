from pydantic import BaseModel


class LoginRequest(BaseModel):
    email: str
    password: str


class RegistrationRequest(BaseModel):
    password: str
    confirm_password: str
    username: str
    full_name: str


class User(BaseModel):
    id: int
    email: str
    username: str


class LoginResponse(BaseModel):
    access_token: str
    refresh_token: str


class LoginData(BaseModel):
    username: str
    password: str

