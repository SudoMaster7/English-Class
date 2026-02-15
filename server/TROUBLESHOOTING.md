# 🔧 Guia de Troubleshooting - Backend

## Problema: Servidor não está respondendo

### Sintomas
- `npm run dev` não mostra output
- Teste de conexão falha
- Servidor não responde em http://localhost:5000

### Soluções

#### 1. Verificar String de Conexão MongoDB

A string de conexão **DEVE** incluir o nome do banco de dados:

```env
# ❌ ERRADO - falta o nome do DB
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/?appName=Cluster0

# ✅ CORRETO - inclui /english-learning
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/english-learning?retryWrites=true&w=majority&appName=Cluster0
```

#### 2. Verificar MongoDB Atlas Network Access

1. Acesse [MongoDB Atlas](https://cloud.mongodb.com)
2. Vá em **Network Access** no menu lateral
3. Adicione seu IP ou use `0.0.0.0/0` (permite qualquer IP - apenas para desenvolvimento)
4. Aguarde 1-2 minutos para propagar

#### 3. Reiniciar o Servidor

Após corrigir o `.env`:

```bash
# Pare o servidor (Ctrl+C no terminal)
# Reinicie:
npm run dev
```

#### 4. Verificar Logs

O servidor deve mostrar:

```
✅ MongoDB Connected: cluster0-shard-00-00.xxxxx.mongodb.net
╔════════════════════════════════════════════════╗
║   🚀 English Learning Platform API Server     ║
║   Environment: development                     ║
║   Port: 5000                                   ║
║   Status: Running ✅                           ║
╚════════════════════════════════════════════════╝
```

#### 5. Testar Manualmente

```bash
# No navegador ou novo terminal PowerShell:
# Instale o Invoke-WebRequest alias
iwr http://localhost:5000/health

# Ou use navegador:
# http://localhost:5000/health
```

#### 6. Verificar se Porta 5000 está livre

```powershell
# Ver o que está usando a porta 5000
netstat -ano | findstr :5000

# Se algo estiver usando, mude a porta no .env:
PORT=5001
```

## Outros Problemas Comuns

### Erro: "Cannot find module"

```bash
# Reinstale dependências
rm -rf node_modules
rm package-lock.json
npm install
```

### Erro: "EADDRINUSE"

Porta já está em uso. Mude em `.env`:

```env
PORT=5001
```

### Email Service Error

É normal! Email é opcional. Para desativar temporariamente, comente as linhas de email no código.

## Teste Rápido de Saúde

Execute:

```bash
node test-connection.js
```

Deve mostrar:
```
✅ Server is running!
📍 Status: 200
📦 Response: {"status":"OK","timestamp":"..."}
```

## MongoDB Atlas - Checklist

- [ ] Cluster criado (tier M0 gratuito)
- [ ] Usuário do banco criado (Database Access)
- [ ] Network Access configurado (0.0.0.0/0 para dev)
- [ ] Connection string copiada com **nome do DB**
- [ ] String de conexão no `.env`

## Ainda não funciona?

Compartilhe:
1. Output do `npm run dev`
2. Conteúdo do arquivo `.env` (sem credenciais)
3. Erro exato que aparece

---

**Última atualização**: 2026-02-14
