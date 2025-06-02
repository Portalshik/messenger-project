FROM python:3.12-slim

WORKDIR /app

# Копируем файлы из директории app
COPY app/requirements.txt .
RUN python -m venv venv
RUN source venv/bin/activate
RUN pip install -r requirements.txt
# RUN pip install git+https://github.com/sqlalchemy/sqlalchemy.git

# Копируем остальные файлы из директории app
COPY app/ .

EXPOSE 8080

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8080"] 