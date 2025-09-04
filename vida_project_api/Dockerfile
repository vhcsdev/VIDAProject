# Estágio de build - com ferramentas de compilação
FROM python:3.12-slim as builder

# Instalar dependências de build
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    cmake \
    pkg-config \
    git \
    portaudio19-dev \
    && rm -rf /var/lib/apt/lists/*

# Configurar Poetry
ENV POETRY_NO_INTERACTION=1 \
    POETRY_VIRTUALENVS_CREATE=false \
    POETRY_CACHE_DIR=/tmp/poetry_cache

# Instalar Poetry
RUN pip install --no-cache-dir poetry

WORKDIR /app

# Copiar apenas arquivos de dependências
COPY pyproject.toml poetry.lock ./

# Instalar dependências - adicionado --no-root
RUN poetry install --only=main --no-root && rm -rf $POETRY_CACHE_DIR

# Estágio final - imagem limpa
FROM python:3.12-slim

# Criar usuário não-root
RUN useradd --create-home --shell /bin/bash appuser

# Instalar apenas dependências de runtime
RUN apt-get update && apt-get install -y --no-install-recommends \
    ffmpeg \
    libportaudio2 \
    && rm -rf /var/lib/apt/lists/* \
    && apt-get clean

# Copiar Python packages do estágio de build
COPY --from=builder /usr/local/lib/python3.12/site-packages /usr/local/lib/python3.12/site-packages
COPY --from=builder /usr/local/bin /usr/local/bin

WORKDIR /app

# Copiar apenas código da aplicação
COPY --chown=appuser:appuser . .

# Mudar para usuário não-root
USER appuser

EXPOSE 8000

# Usar uvicorn diretamente (mais eficiente que poetry run)
CMD ["uvicorn", "vida_project_api.app:app", "--host", "0.0.0.0", "--port", "8000"]
