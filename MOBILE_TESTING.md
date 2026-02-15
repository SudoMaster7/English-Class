# 📱 Como Rodar Frontend e Acessar do Celular

## 🎯 Objetivo
Rodar o frontend em um servidor local e acessar do celular na mesma rede WiFi.

---

## ✅ Método 1: Live Server (VS Code) - RECOMENDADO

### Passo 1: Instalar extensão
1. Abra VS Code
2. Vá em Extensions (Ctrl+Shift+X)
3. Procure "Live Server"
4. Instale a extensão de Ritwick Dey

### Passo 2: Configurar para rede externa
1. Abra Settings (Ctrl+,)
2. Procure "Live Server"
3. Encontre "Live Server > Settings: Use Local Ip"
4. **Marque a opção** ✅

### Passo 3: Iniciar servidor
1. Abra `index.html` no VS Code
2. Clique com botão direito → "Open with Live Server"
3. OU clique em "Go Live" no canto inferior direito

### Passo 4: Acessar do celular
O VS Code vai mostrar algo como:
```
Server started at http://192.168.1.X:5500
```

**No seu celular**, abra o navegador e digite:
```
http://192.168.1.X:5500
```
(Substitua X pelo número que aparecer)

---

## ✅ Método 2: http-server (Node.js)

### Passo 1: Instalar
```bash
npm install -g http-server
```

### Passo 2: Rodar servidor
```bash
# Na pasta raiz do projeto (onde está index.html)
cd "c:\Users\leosc\OneDrive\Área de Trabalho\aula ingles"
http-server -p 8080 -o
```

### Passo 3: Ver seu IP
```bash
ipconfig
```

Procure por "IPv4 Address" na seção "Wireless LAN adapter Wi-Fi".  
Exemplo: `192.168.1.105`

### Passo 4: Acessar do celular
No navegador do celular:
```
http://192.168.1.105:8080
```

---

## ✅ Método 3: Python SimpleHTTPServer

### Se você tem Python 3:
```bash
# Na pasta raiz
cd "c:\Users\leosc\OneDrive\Área de Trabalho\aula ingles"
python -m http.server 8080
```

### Acessar:
1. Descubra seu IP com `ipconfig`
2. No celular: `http://SEU_IP:8080`

---

## ⚙️ Configurar Backend para Aceitar Conexões Externas

### Problema:
O backend está rodando em `localhost:5000`, mas o celular não consegue acessar.

### Solução:

#### Opção A: Atualizar URL no Frontend Temporariamente

Edite `js/api.js` linha 6:
```javascript
// Antes
const API_CONFIG = {
    BASE_URL: 'http://localhost:5000/api',
    TIMEOUT: 10000
};

// Depois (use SEU IP local)
const API_CONFIG = {
    BASE_URL: 'http://192.168.1.105:5000/api',  // Seu IP aqui!
    TIMEOUT: 10000
};
```

**⚠️ Lembre-se:** Volte para `localhost` depois dos testes!

#### Opção B: Configuração Dinâmica (Melhor!)

Edite `js/api.js`:
```javascript
// Detecta automaticamente se está em localhost ou rede
const API_CONFIG = {
    BASE_URL: window.location.hostname === 'localhost' 
        ? 'http://localhost:5000/api'
        : `http://${window.location.hostname}:5000/api`,
    TIMEOUT: 10000
};
```

Mas para isso funcionar, você precisa rodar frontend e backend no mesmo IP.

---

## 🔥 Solução Completa (Recomendada)

### 1. Descubra seu IP local
```bash
ipconfig
```
Exemplo: `192.168.1.105`

### 2. Inicie o Backend
```bash
cd server
npm run dev
```
Backend roda em `http://192.168.1.105:5000`

### 3. Atualize API temporariamente
Em `js/api.js`:
```javascript
const API_CONFIG = {
    BASE_URL: 'http://192.168.1.105:5000/api',  // SEU IP!
    TIMEOUT: 10000
};
```

### 4. Inicie Frontend
```bash
# Método Live Server (VS Code)
# OU
http-server -p 8080
```

### 5. No Celular
```
http://192.168.1.105:8080
```

---

## 🛡️ Firewall

Se não funcionar, pode ser firewall do Windows:

1. Abra "Windows Defender Firewall"
2. "Configurações Avançadas"
3. "Regras de Entrada"
4. "Nova Regra..."
5. Tipo: Porta
6. Protocolo: TCP
7. Porta: 8080, 5000
8. Permitir conexão
9. Nome: "Dev Server"

---

## 📱 QR Code (Bônus)

Instale extensão para gerar QR Code:
```bash
npm install -g qrcode-terminal
```

Depois no terminal:
```bash
qrcode-terminal "http://192.168.1.105:8080"
```

Escaneie o QR Code no celular! 📸

---

## ✅ Checklist Rápido

- [ ] Descobrir IP local (`ipconfig`)
- [ ] Iniciar backend (`npm run dev` na pasta server)
- [ ] Atualizar `js/api.js` com seu IP
- [ ] Iniciar frontend (Live Server ou http-server)
- [ ] Celular na mesma rede WiFi
- [ ] Abrir `http://SEU_IP:PORTA` no celular

---

**🎉 Pronto! Agora pode testar no celular!**
