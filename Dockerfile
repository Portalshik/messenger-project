FROM python:3.12-slim

WORKDIR /app

# Копируем файлы из директории app
COPY app/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
# RUN pip install git+https://github.com/sqlalchemy/sqlalchemy.git

# Копируем остальные файлы из директории app
COPY app/ .

ENV PORT=8080
EXPOSE $PORT

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "$PORT"] 