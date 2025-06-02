FROM alpine:3.19

# Установка Python и необходимых зависимостей
RUN apk add --no-cache \
    python3 \
    py3-pip \
    python3-dev \
    gcc \
    musl-dev \
    linux-headers

WORKDIR /app

# Копируем файлы из директории app
COPY app/requirements.txt .

# Создаем и активируем виртуальное окружение
RUN python3 -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# Устанавливаем зависимости
RUN pip install --no-cache-dir -r requirements.txt

# Копируем остальные файлы из директории app
COPY app/ .

EXPOSE 8080

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8080"] 