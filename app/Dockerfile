FROM python:3.12-slim

WORKDIR /app

# Копируем только requirements.txt сначала для кэширования слоя
COPY ./requirements.txt /app/requirements.txt
RUN pip install --no-cache-dir -r /app/requirements.txt
RUN pip install git+https://github.com/sqlalchemy/sqlalchemy.git

# Копируем остальные файлы
COPY . /app/

ENV PORT=8080
EXPOSE $PORT

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "$PORT"] 