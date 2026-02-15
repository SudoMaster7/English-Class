# 🔌 Guia de Integração Frontend-Backend

## ✅ O que foi implementado

### Backend API (Completo)
- ✅ Servidor Express rodando em `http://localhost:5000`
- ✅ Autenticação JWT com refresh tokens
- ✅ Endpoints de registro, login, reset de senha
- ✅ Sistema de streak e XP automático
- ✅ Rate limiting e segurança

### Frontend Integration (Completo)
- ✅ API client (`js/api.js`) com gerenciamento de tokens
- ✅ Páginas de login (`login.html`) e registro (`register.html`)
- ✅ Botão de login/logout na navegação
- ✅ Notificações visuais
- ✅ Migração de dados LocalStorage (planejada para Fase 2)

---

## 📁 Arquivos Criados

### Backend
```
server/
├── config/database.js           ✅ Conexão MongoDB
├── models/
│   ├── User.js                  ✅ Modelo de usuário
│   └── Progress.js              ✅ Modelo de progresso
├── routes/
│   ├── auth.js                  ✅ Rotas de autenticação
│   └── ...                      📋 Placeholders para Fase 2
├── middleware/
│   ├── authenticate.js          ✅ JWT auth
│   ├── rateLimiter.js           ✅ Rate limiting
│   └── errorHandler.js          ✅ Error handling
├── services/emailService.js     ✅ Email service
└── test-api.js                  ✅ Script de testes
```

### Frontend
```
├── js/api.js                    ✅ API client wrapper
├── login.html                   ✅ Página de login
├── register.html                ✅ Página de registro
└── index.html                   ✅ Integrado com auth
```

---

## 🧪 Como Testar

### 1. Backend está rodando?
```bash
cd server
npm run dev
```

Você deve ver:
```
✅ MongoDB Connected: cluster0...
🚀 English Learning Platform API Server
Port: 5000
Status: Running ✅
```

### 2. Teste os endpoints:
```bash
node test-api.js
```

Deve mostrar:
```
✅ Health Check: OK
✅ Registro: SUCESSO
✅ Login: SUCESSO
✅ Endpoint autenticado: SUCESSO
🎉 TODOS OS TESTES PASSARAM!
```

### 3. Teste no navegador:

**Registrar novo usuário:**
1. Abra `register.html`
2. Preencha nome, email, senha
3. Clique em "Criar Conta"
4. Você será redirecionado para `index.html` autenticado

**Login:**
1. Abra `login.html`
2. Use email e senha do registro
3. Clique em "Entrar"
4. Você verá suas informações no canto superior direito

**Logout:**
1. Clique no seu nome no canto superior
2. Confirme "Deseja sair?"

---

## 🔑 Como o Sistema de Auth Funciona

### 1. Registro (`register.html`)
```javascript
// Usuário preenche formulário
const response = await API.auth.register(email, password, name);

// Backend cria usuário e retorna tokens
// {
//   success: true,
//   data: {
//     user: { id, email, name, ... },
//     tokens: { authToken, refreshToken }
//   }
// }

// Tokens são salvos no localStorage
localStorage.setItem('authToken', authToken);
localStorage.setItem('refreshToken', refreshToken);
```

### 2. Login (`login.html`)
```javascript
const response = await API.auth.login(email, password);

// Backend verifica credenciais
// Atualiza streak automaticamente
// Retorna user + tokens
```

### 3. Requisições Autenticadas
```javascript
// O API client adiciona automaticamente o token
const userData = await API.auth.getCurrentUser();

// Internamente:
headers: {
  'Authorization': `Bearer ${authToken}`
}
```

### 4. Refresh de Token Automático
```javascript
// Se o token expirou (401):
// 1. API cliente tenta renovar com refreshToken
// 2. Se sucesso: refaz a requisição original
// 3. Se falha: redireciona para login
```

---

## 📊 Dados do Usuário

### No LocalStorage:
```javascript
{
  authToken: "JWT token...",
  refreshToken: "Refresh token...",
  user: {
    id: "...",
    email: "user@example.com",
    name: "Nome do Usuário",
    level: 1,
    xp: 0,
    streak: 1,
    coins: 0,
    tier: "free"
  }
}
```

### Acessar dados:
```javascript
const user = API.getStoredUser();
console.log(user.name);  // "Nome do Usuário"
console.log(user.xp);    // 0
console.log(user.streak); // 1
```

---

## 🎮 Próximos Passos (Fase 2)

### Implementar APIs de Progresso:

1. **Salvar pontuação de jogo:**
```javascript
// Em cada jogo, quando terminar:
await API.progress.recordGame('memory-match', score, timeSpent);
```

2. **Completar lição:**
```javascript
await API.progress.completeLesson(themeId, level, score);
```

3. **Sincronizar dados:**
```javascript
// Carregar progresso do backend
const progress = await API.progress.get();

// Atualizar dashboard com dados reais
updateDashboardFromBackend(progress);
```

### Arquivo a Criar: `routes/progress.js`

```javascript
// POST /api/progress/game
// Salvar score de jogo

// POST /api/progress/lesson
// Completar lição

// GET /api/progress
// Obter todo o progresso do usuário

// POST /api/progress/vocabulary/review
// Sistema SRS de vocabulário
```

---

## 🎨 Customizações

### Mudar cor do botão de login:
Em `index.html` linha ~40:
```html
<button id="auth-button" style="background: linear-gradient(135deg, #10b981, #059669);">
```

### Mudar URL do backend:
Em `js/api.js` linha 6:
```javascript
const API_CONFIG = {
    BASE_URL: 'https://seu-backend-em-producao.com/api',
    // ...
};
```

### Adicionar notificação customizada:
```javascript
API.showNotification('Mensagem aqui!', 'success'); // success | error | info
```

---

## 🚀 Deploy para Produção

### Backend (Render/Railway):
```bash
# 1. Criar conta no Render.com
# 2. Conectar repositório GitHub
# 3. Configurar variáveis de ambiente:
MONGODB_URI=...
JWT_SECRET=...
JWT_REFRESH_SECRET=...
FRONTEND_URL=https://seu-frontend.vercel.app

# 4. Deploy automático!
```

### Frontend (Vercel):
```bash
# Já está no Vercel!
# Apenas atualize a URL do backend em js/api.js:

const API_CONFIG = {
    BASE_URL: 'https://seu-backend.onrender.com/api'
};
```

---

## 🔧 Solução de Problemas

### "Token expirado"
- Normal após 7 dias
- Sistema faz refresh automático
- Se refresh falhar: usuário precisa fazer login novamente

### "CORS error"
- Backend precisa permitir origem do frontend
- Já configurado em `server.js` com variável `FRONTEND_URL`

### "Cannot connect to backend"
- Verifique se backend está rodando (`npm run dev`)
- Verifique URL em `js/api.js`
- Abra console do navegador para ver erros

---

## 📖 Documentação da API

Veja `server/README.md` para documentação completa de todos os endpoints.

---

**🎉 Integração completa! Agora você tem um sistema de autenticação profissional funcionando!**

Próximo passo: Implementar Fase 2 com progresso, lições e games integrados ao backend.
