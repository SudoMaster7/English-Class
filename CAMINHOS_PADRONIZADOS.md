# 🗂️ GUIA DEFINITIVO - CAMINHOS PADRONIZADOS

## ✅ ESTRUTURA DE ARQUIVOS

```
aula ingles/
├── index.html          (raiz)
├── css/
│   └── style.css       ⚠️ IMPORTANTE: É "style.css" NÃO "styles.css"
├── js/
│   ├── api.js
│   ├── storage.js
│   ├── lessons.js
│   ├── achievements.js
│   └── ... (outros)
└── pages/
    ├── auth/
    │   ├── login.html
    │   └── register.html
    ├── gamification/
    │   ├── dashboard.html
    │   ├── shop.html
    │   ├── leaderboard.html
    │   └── friends.html
    └── lessons/
        └── placement-test.html
```

---

## 📋 CAMINHOS CORRETOS POR ARQUIVO

### 🏠 **index.html** (raiz)
```html
<link rel="stylesheet" href="css/style.css">
<script src="js/api.js"></script>
<script src="js/storage.js"></script>

<a href="pages/auth/login.html">Login</a>
<a href="pages/gamification/dashboard.html">Dashboard</a>
<a href="pages/lessons/placement-test.html">Teste</a>
```

---

### 🔐 **pages/auth/login.html**
```html
<!-- CSS e JS -->
<link rel="stylesheet" href="../../css/style.css"> ✅
<script src="../../js/api.js"></script> ✅

<!-- Links -->
<a href="../../index.html">Voltar</a>
<a href="register.html">Registrar</a>
```

### 🔐 **pages/auth/register.html**
```html
<!-- CSS e JS -->
<link rel="stylesheet" href="../../css/style.css"> ✅
<script src="../../js/api.js"></script> ✅

<!-- Links -->
<a href="../../index.html">Voltar</a>
<a href="login.html">Login</a>
<a href="../lessons/placement-test.html">Teste</a> ✅
```

---

### 🎮 **pages/gamification/dashboard.html**
```html
<!-- CSS e JS -->
<link rel="stylesheet" href="../../css/style.css"> ✅
<script src="../../js/api.js"></script> ✅

<!-- Links -->
<a href="../../index.html">Home</a>
<a href="leaderboard.html">Rankings</a>
<a href="shop.html">Loja</a>
<a href="../lessons/placement-test.html">Teste</a>
```

### 🛒 **pages/gamification/shop.html**
### 🏆 **pages/gamification/leaderboard.html**
### 👥 **pages/gamification/friends.html**
```html
<!-- CSS e JS (IGUAL PARA TODOS) -->
<link rel="stylesheet" href="../../css/style.css"> ✅
<script src="../../js/api.js"></script> ✅
```

---

### 📝 **pages/lessons/placement-test.html**
```html
<!-- CSS e JS -->
<link rel="stylesheet" href="../../css/style.css"> ✅
<script src="../../js/api.js"></script> ✅
<script src="../../js/storage.js"></script> ✅
<script src="../../js/lessons.js"></script> ✅

<!-- Links -->
<a href="../../index.html">Voltar</a>
```

---

## ⚠️ ERROS COMUNS

| ❌ ERRADO | ✅ CORRETO |
|-----------|-----------|
| `styles.css` | `style.css` |
| `css/style.css` (em pages/) | `../../css/style.css` |
| `js/api.js` (em pages/) | `../../js/api.js` |
| `/login.html` | `pages/auth/login.html` |
| `index.html` (em pages/) | `../../index.html` |

---

## 🎯 REGRA SIMPLES

### **De index.html (raiz)**:
- CSS/JS: `css/style.css`, `js/api.js`
- Pages: `pages/auth/login.html`

### **De pages/auth/** ou **pages/gamification/** ou **pages/lessons/**:
- CSS/JS: `../../css/style.css`, `../../js/api.js`
- Voltar: `../../index.html`
- Outras pages: `../auth/login.html`, `../lessons/placement-test.html`

---

## ✅ STATUS ATUAL

| Arquivo | CSS | JS | Links | Status |
|---------|-----|-----|-------|--------|
| index.html | ✅ | ✅ | ✅ | OK |
| pages/auth/login.html | ✅ CORRIGIDO | ✅ | ✅ | OK |
| pages/auth/register.html | ✅ | ✅ | ✅ | OK |
| pages/gamification/dashboard.html | ✅ | ✅ | ✅ | OK |
| pages/gamification/shop.html | ✅ | ✅ | ✅ | OK |
| pages/gamification/leaderboard.html | ✅ | ✅ | ✅ | OK |
| pages/gamification/friends.html | ✅ | ✅ | ✅ | OK |
| pages/lessons/placement-test.html | ✅ | ✅ | ✅ | OK |

---

## 🚀 TESTE RÁPIDO

1. Limpe o cache: **Ctrl + Shift + R**
2. Acesse: http://localhost:8080/index.html
3. Clique em "Login"
4. Verifique se CSS carrega ✅
5. Tente fazer login

**Se ainda der erro 404**, verifique:
- Nome do arquivo CSS: deve ser `style.css`
- Caminhos relativos: `../../` para subir 2 níveis
