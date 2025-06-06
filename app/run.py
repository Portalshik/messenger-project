import uvicorn
from main import app

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",  # Разрешаем доступ из любой сети
        port=8080,
        reload=True
    )
