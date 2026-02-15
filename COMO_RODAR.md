# 🚀 Como Rodar Frontend + Backend Juntos

## Opção 1: Usando o Script Batch (RECOMENDADO) ⚡

Na pasta raiz do projeto, execute:

```bash
start.bat
```

## Opção 2: Usando NPM

Entre na pasta `server` e execute:

```bash
cd server
npm run dev:all
```

## O que acontece?

- ✅ **Backend** inicia na porta **5000** (Node.js + Express)
- ✅ **Frontend** inicia na porta **8080** (http-server)
- ✅ Ambos rodam em **paralelo** no mesmo terminal
- ✅ **Cores diferentes** para facilitar identificação:
  - 🔵 Backend (azul)
  - 🟢 Frontend (verde)

## Acessar o Sistema

Depois de rodar, acesse:

- **Frontend**: http://localhost:8080
- **Backend API**: http://localhost:5000/api

## Parar os Servidores

Pressione `Ctrl + C` uma vez para parar ambos.

## Comandos Separados (se preferir)

### Apenas Backend:
```bash
cd server
npm run dev
```

### Apenas Frontend:
```bash
http-server -p 8080
```

---

💡 **Dica**: O script `start.bat` é a forma mais fácil de iniciar tudo de uma vez!
