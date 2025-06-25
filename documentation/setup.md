# 🔧 Configuração do Ambiente - VIDA Project

Este guia detalha como configurar o ambiente de desenvolvimento do projeto VIDA.

## 📋 Pré-requisitos

### Sistema Operacional

- **Linux** (Ubuntu 20.04+ recomendado)
- **macOS** (10.15+ recomendado)
- **Windows** (com WSL2 recomendado)

### Ferramentas Necessárias

- **Python 3.13+**
- **Poetry** (gerenciador de dependências)
- **Docker** & **Docker Compose**
- **Git**
- **Node.js 18+** (para ferramentas de desenvolvimento)

## 🚀 Instalação Detalhada

### 1. Python e Poetry

#### No Linux/macOS:

```bash
# Instalar Python 3.13
sudo apt update
sudo apt install python3.13 python3.13-venv python3.13-dev

# Instalar Poetry
curl -sSL https://install.python-poetry.org | python3 -
```

#### No macOS (com Homebrew):

```bash
# Instalar Python
brew install python@3.13

# Instalar Poetry
brew install poetry
```

### 2. Configuração do Projeto

```bash
# Clone o repositório
git clone https://github.com/unb-mds/VIDAProject.git
cd VIDAProject/vida_project_api

# Configurar Poetry
poetry config virtualenvs.in-project true
poetry install

# Ativar ambiente virtual
poetry shell
```

### 3. Dependências de Sistema

#### Ubuntu/Debian:

```bash
# Para PyAudio
sudo apt install portaudio19-dev

# Para processamento de áudio
sudo apt install ffmpeg libsndfile1

# Para PostgreSQL (desenvolvimento)
sudo apt install postgresql-client libpq-dev
```

#### macOS:

```bash
# Para PyAudio
brew install portaudio

# Para processamento de áudio
brew install ffmpeg libsndfile

# Para PostgreSQL
brew install postgresql
```

### 4. Docker Setup

```bash
# Verificar instalação
docker --version
docker-compose --version

# Construir e iniciar serviços
docker-compose up -d

# Verificar status
docker-compose ps
```

## ⚙️ Configuração Avançada

### Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto:

```bash
# Database
DATABASE_URL=postgresql+psycopg://vida_user:vida_teste_password@localhost:5432/vida_db

# API
API_HOST=0.0.0.0
API_PORT=8000
DEBUG=true

# ML Models
MODEL_CACHE_DIR=./pretrained_models
SPEECHBRAIN_CACHE_DIR=./speechbrain_cache

# Audio Settings
SAMPLE_RATE=16000
RECORDING_DURATION=5
AUDIO_FORMAT=wav

# Security
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

### Configuração do IDE

#### VS Code

Instale as extensões recomendadas:

```json
{
  "recommendations": [
    "ms-python.python",
    "ms-python.black-formatter",
    "charliermarsh.ruff",
    "ms-python.mypy-type-checker",
    "ms-toolsai.jupyter"
  ]
}
```

#### PyCharm

- Configure o interpretador Python para usar o Poetry
- Ative o Black como formatador
- Configure o Ruff como linter

### Configuração de Desenvolvimento

```bash
# Instalar ferramentas de desenvolvimento
poetry install --with dev

# Configurar pre-commit hooks
pre-commit install

# Configurar git hooks personalizados
cp .githooks/* .git/hooks/
chmod +x .git/hooks/*
```

## 🧪 Validação da Instalação

### Testes Básicos

```bash
# Testar instalação Python
python --version

# Testar Poetry
poetry --version

# Testar dependências
poetry run python -c "import torch; print(torch.__version__)"
poetry run python -c "import speechbrain; print('SpeechBrain OK')"
poetry run python -c "import fastapi; print('FastAPI OK')"
```

### Teste de Funcionalidade

```bash
# Executar testes
poetry run pytest -v

# Testar API
poetry run uvicorn vida_project_api.app:app --reload

# Em outro terminal, testar endpoint
curl http://localhost:8000/
```

### Teste de Áudio

```bash
# Testar captura de áudio
poetry run python -c "
import pyaudio
p = pyaudio.PyAudio()
print(f'Dispositivos de áudio: {p.get_device_count()}')
p.terminate()
"
```

## 🛠️ Problemas Comuns

### Erro: `ModuleNotFoundError: No module named 'pyaudio'`

```bash
# Linux
sudo apt install portaudio19-dev
poetry install

# macOS
brew install portaudio
poetry install
```

### Erro: `torch` não encontrado

```bash
# Reinstalar PyTorch
poetry remove torch torchaudio
poetry add torch torchaudio --index-url https://download.pytorch.org/whl/cpu
```

### Erro: Docker não conecta ao PostgreSQL

```bash
# Resetar containers
docker-compose down -v
docker-compose up -d

# Verificar logs
docker-compose logs vida_project_database
```

### Erro: Permissão de microfone

```bash
# Linux: Adicionar usuário ao grupo audio
sudo usermod -a -G audio $USER
# Logout e login novamente
```

## 📊 Monitoramento

### Logs de Desenvolvimento

```bash
# Logs da aplicação
tail -f logs/app.log

# Logs do Docker
docker-compose logs -f

# Logs do PostgreSQL
docker-compose logs vida_project_database
```

### Métricas

```bash
# Uso de memória do modelo
poetry run python -c "
import psutil
import torch
print(f'Memória RAM: {psutil.virtual_memory().percent}%')
print(f'PyTorch CUDA: {torch.cuda.is_available()}')
"
```

## 🔒 Segurança

### Configurações Recomendadas

- Use senhas fortes para o banco de dados
- Configure HTTPS em produção
- Mantenha as dependências atualizadas
- Use variáveis de ambiente para secrets

### Auditoria de Segurança

```bash
# Verificar vulnerabilidades
poetry audit

# Verificar dependências desatualizadas
poetry show --outdated
```

---

_Para mais informações, consulte a [documentação completa](../docs/) ou abra uma [issue](https://github.com/unb-mds/VIDAProject/issues)._
