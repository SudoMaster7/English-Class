# 🔧 Erros Comuns e Soluções Rápidas

## ❌ CORS Error

### Erro:
```
Access-Control-Allow-Origin header has a value 'http://localhost:3000' 
that is not equal to the supplied origin
```

### ✅ Solução:
Já corrigi o servidor! Reinicie o backend:
```bash
# Ctrl+C no terminal do servidor
npm run dev
```

Agora aceita requisições de qualquer origem em desenvolvimento.

---

## ⚠️ Email Service Error (Opcional)

### Erro:
```
Email send error: Error: connect ECONNREFUSED 127.0.0.1:587
```

### Explicação:
Isso é **NORMAL** se você não configurou o serviço de email. 

### O que acontece:
- ✅ Registro funciona normalmente
- ✅ Usuário é criado
- ❌ Email de verificação não é enviado (apenas log no console)

### Para desativar o aviso:
Não é necessário! O sistema funciona mesmo sem email.

### Para configurar email (opcional):
1. Use Gmail com "App Password"
2. Vá em: https://myaccount.google.com/apppasswords
3. Crie uma senha de app
4. Atualize `.env`:
```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=seuemail@gmail.com
EMAIL_PASSWORD=sua-senha-de-app-aqui
```

---

## 🌐 Como Abrir o Frontend

### Opção 1: Live Server (VS Code)
1. Instale extensão "Live Server"
2. Clique direito em `index.html`
3. "Open with Live Server"

### Opção 2: Python Simple Server
```bash
# Na pasta raiz do projeto
python -m http.server 8000
# Abra: http://localhost:8000
```

### Opção 3: Node HTTP Server
```bash
# Instalar
npm install -g http-server

# Executar
http-server -p 8000
# Abra: http://localhost:8000
```

### Opção 4: Abrir direto (funciona agora com CORS corrigido!)
- Só abrir `register.html` diretamente no navegador
- Funciona porque corrigi o CORS!

---

## 🧪 Testar Agora

1. **Reinicie o backend**:
```bash
# No terminal do servidor
Ctrl+C
npm run dev
```

2. **Abra `register.html`** no navegador

3. **Crie uma conta** com qualquer email

4. **Deve funcionar!** ✅

---

## 📝 Checklist de Troubleshooting

- [ ] Backend rodando (`npm run dev`)
- [ ] CORS corrigido (já fiz!)
- [ ] Browser console sem erros
- [ ] Se ainda der erro: reinicie o navegador

---

**🎉 Após reiniciar o servidor, tudo deve funcionar perfeitamente!**
