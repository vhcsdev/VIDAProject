# 📡 Documentação da API - VIDA Project

Esta documentação detalha todos os endpoints da API do projeto VIDA.

## 🌐 URL Base

- **Desenvolvimento**: `http://localhost:8000`
- **Produção**: `https://api.vida-project.com`

## 📋 Índice

- [Autenticação](#autenticação)
- [Endpoints de Usuário](#endpoints-de-usuário)
- [Endpoints de Voz](#endpoints-de-voz)
- [Endpoints de Autenticação](#endpoints-de-autenticação)
- [Códigos de Status](#códigos-de-status)
- [Modelos de Dados](#modelos-de-dados)

---

## 🔐 Autenticação

A API utiliza JWT (JSON Web Tokens) para autenticação.

### Cabeçalho de Autorização

```http
Authorization: Bearer <seu-jwt-token>
```

### Obter Token

```http
POST /auth/token
Content-Type: application/json

{
  "username": "usuario@exemplo.com",
  "password": "senha123"
}
```

**Resposta:**

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "expires_in": 1800
}
```

---

## 👤 Endpoints de Usuário

### Criar Usuário

```http
POST /users/
Content-Type: application/json

{
  "email": "usuario@exemplo.com",
  "username": "usuario123",
  "full_name": "João Silva",
  "password": "senha123"
}
```

**Resposta (201 Created):**

```json
{
  "id": "uuid-do-usuario",
  "email": "usuario@exemplo.com",
  "username": "usuario123",
  "full_name": "João Silva",
  "is_active": true,
  "created_at": "2025-01-15T10:30:00Z",
  "voice_profile_exists": false
}
```

### Obter Perfil do Usuário

```http
GET /users/me
Authorization: Bearer <token>
```

**Resposta (200 OK):**

```json
{
  "id": "uuid-do-usuario",
  "email": "usuario@exemplo.com",
  "username": "usuario123",
  "full_name": "João Silva",
  "is_active": true,
  "created_at": "2025-01-15T10:30:00Z",
  "voice_profile_exists": true,
  "last_voice_auth": "2025-01-15T14:20:00Z"
}
```

### Atualizar Usuário

```http
PUT /users/me
Authorization: Bearer <token>
Content-Type: application/json

{
  "full_name": "João Silva Santos",
  "email": "novo@exemplo.com"
}
```

---

## 🎤 Endpoints de Voz

### Cadastrar Perfil de Voz

```http
POST /voice/profile
Authorization: Bearer <token>
Content-Type: multipart/form-data

audio_file: [arquivo de áudio .wav]
```

**Parâmetros:**

- `audio_file`: Arquivo de áudio WAV (máx. 10MB, 5-10 segundos)

**Resposta (201 Created):**

```json
{
  "message": "Perfil de voz cadastrado com sucesso",
  "profile_id": "uuid-do-perfil",
  "audio_duration": 5.2,
  "embedding_size": 512,
  "quality_score": 0.95
}
```

### Verificar Voz

```http
POST /voice/verify
Authorization: Bearer <token>
Content-Type: multipart/form-data

audio_file: [arquivo de áudio .wav]
```

**Resposta (200 OK):**

```json
{
  "verified": true,
  "confidence_score": 0.92,
  "threshold": 0.8,
  "verification_id": "uuid-da-verificacao",
  "timestamp": "2025-01-15T14:25:00Z"
}
```

### Obter Histórico de Verificações

```http
GET /voice/history?limit=10&offset=0
Authorization: Bearer <token>
```

**Resposta (200 OK):**

```json
{
  "verifications": [
    {
      "id": "uuid-da-verificacao",
      "verified": true,
      "confidence_score": 0.92,
      "timestamp": "2025-01-15T14:25:00Z",
      "device_info": "Mozilla/5.0..."
    }
  ],
  "total": 25,
  "page": 1,
  "pages": 3
}
```

### Retreinar Modelo

```http
POST /voice/retrain
Authorization: Bearer <token>
Content-Type: multipart/form-data

audio_files: [múltiplos arquivos de áudio]
```

---

## 🔓 Endpoints de Autenticação

### Login com Voz

```http
POST /auth/voice-login
Content-Type: multipart/form-data

username: usuario123
audio_file: [arquivo de áudio .wav]
```

**Resposta (200 OK):**

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "expires_in": 1800,
  "user": {
    "id": "uuid-do-usuario",
    "username": "usuario123",
    "full_name": "João Silva"
  },
  "verification": {
    "confidence_score": 0.94,
    "verification_id": "uuid-da-verificacao"
  }
}
```

### Refresh Token

```http
POST /auth/refresh
Authorization: Bearer <refresh-token>
```

### Logout

```http
POST /auth/logout
Authorization: Bearer <token>
```

---

## 📊 Endpoints de Monitoramento

### Status da API

```http
GET /health
```

**Resposta (200 OK):**

```json
{
  "status": "healthy",
  "version": "1.0.0",
  "timestamp": "2025-01-15T14:30:00Z",
  "services": {
    "database": "healthy",
    "ml_models": "healthy",
    "audio_processing": "healthy"
  }
}
```

### Métricas

```http
GET /metrics
Authorization: Bearer <admin-token>
```

---

## 📄 Códigos de Status

| Código | Significado           | Descrição                              |
| ------ | --------------------- | -------------------------------------- |
| 200    | OK                    | Requisição bem-sucedida                |
| 201    | Created               | Recurso criado com sucesso             |
| 400    | Bad Request           | Dados inválidos na requisição          |
| 401    | Unauthorized          | Token inválido ou ausente              |
| 403    | Forbidden             | Sem permissão para o recurso           |
| 404    | Not Found             | Recurso não encontrado                 |
| 409    | Conflict              | Conflito (ex: usuário já existe)       |
| 422    | Unprocessable Entity  | Dados válidos mas processamento falhou |
| 429    | Too Many Requests     | Limite de taxa excedido                |
| 500    | Internal Server Error | Erro interno do servidor               |

---

## 🏗️ Modelos de Dados

### User

```json
{
  "id": "string (UUID)",
  "email": "string",
  "username": "string",
  "full_name": "string",
  "is_active": "boolean",
  "created_at": "string (ISO 8601)",
  "updated_at": "string (ISO 8601)",
  "voice_profile_exists": "boolean",
  "last_voice_auth": "string (ISO 8601) | null"
}
```

### VoiceProfile

```json
{
  "id": "string (UUID)",
  "user_id": "string (UUID)",
  "embedding": "array<float>",
  "audio_duration": "number",
  "quality_score": "number",
  "created_at": "string (ISO 8601)",
  "updated_at": "string (ISO 8601)"
}
```

### VoiceVerification

```json
{
  "id": "string (UUID)",
  "user_id": "string (UUID)",
  "verified": "boolean",
  "confidence_score": "number",
  "threshold": "number",
  "timestamp": "string (ISO 8601)",
  "device_info": "string",
  "ip_address": "string"
}
```

---

## 🔧 Configuração do Cliente

### Python

```python
import requests
import json

class VidaAPIClient:
    def __init__(self, base_url, token=None):
        self.base_url = base_url
        self.token = token
        self.headers = {
            'Content-Type': 'application/json'
        }
        if token:
            self.headers['Authorization'] = f'Bearer {token}'

    def login(self, username, password):
        response = requests.post(
            f'{self.base_url}/auth/token',
            json={'username': username, 'password': password}
        )
        if response.status_code == 200:
            data = response.json()
            self.token = data['access_token']
            self.headers['Authorization'] = f'Bearer {self.token}'
        return response.json()

    def upload_voice_profile(self, audio_file_path):
        with open(audio_file_path, 'rb') as f:
            files = {'audio_file': f}
            response = requests.post(
                f'{self.base_url}/voice/profile',
                files=files,
                headers={'Authorization': self.headers['Authorization']}
            )
        return response.json()

# Uso
client = VidaAPIClient('http://localhost:8000')
client.login('usuario@exemplo.com', 'senha123')
result = client.upload_voice_profile('audio.wav')
```

### JavaScript

```javascript
class VidaAPIClient {
  constructor(baseUrl, token = null) {
    this.baseUrl = baseUrl;
    this.token = token;
  }

  async login(username, password) {
    const response = await fetch(`${this.baseUrl}/auth/token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
    });

    if (response.ok) {
      const data = await response.json();
      this.token = data.access_token;
      return data;
    }
    throw new Error("Login failed");
  }

  async uploadVoiceProfile(audioFile) {
    const formData = new FormData();
    formData.append("audio_file", audioFile);

    const response = await fetch(`${this.baseUrl}/voice/profile`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.token}`,
      },
      body: formData,
    });

    return response.json();
  }
}

// Uso
const client = new VidaAPIClient("http://localhost:8000");
await client.login("usuario@exemplo.com", "senha123");
const result = await client.uploadVoiceProfile(audioFile);
```

---

## 📚 Documentação Interativa

Acesse a documentação interativa da API:

- **Swagger UI**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`

---

_Para mais informações, consulte o [código fonte](../vida_project_api/) ou abra uma [issue](https://github.com/unb-mds/VIDAProject/issues)._
