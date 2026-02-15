# 📁 Estrutura de Organização do Frontend

## 🎯 Objetivo
Organizar os arquivos HTML em uma estrutura de pastas lógica e fácil de navegar.

## 📂 Estrutura Proposta

```
aula ingles/
├── index.html              (Página principal - PERMANECE NA RAIZ)
│
├── pages/                  (Todas as páginas organizadas)
│   ├── auth/               (Autenticação)
│   │   ├── login.html
│   │   └── register.html
│   │
│   ├── gamification/       (Features gamificados)
│   │   ├── dashboard.html  (Perfil do usuário)
│   │   ├── leaderboard.html
│   │   ├── shop.html
│   │   └── friends.html
│   │
│   └── lessons/            (Lições e testes)
│       ├── daily-lesson.html
│       ├── practice-lesson.html
│       └── placement-test.html
│
├── games/                  (Jogos interativos - JÁ ORGANIZADOS)
│   ├── wordle.html
│   ├── memory.html
│   └── ...
│
├── css/                    (Estilos - JÁ ORGANIZADOS)
│   └── style.css
│
├── js/                     (Scripts - JÁ ORGANIZADOS)
│   ├── api.js
│   ├── lessons.js
│   └── ...
│
└── server/                 (Backend Node.js - JÁ ORGANIZADOS)
    └── ...
```

## ⚠️ IMPORTANTE: Não Mover Ainda

**NÃO vamos mover os arquivos agora** porque isso quebraria todos os links e referências.

Para mover os arquivos corretamente, seria necessário:

1. ✅ Criar as pastas (FEITO)
2. ❌ Mover cada arquivo HTML
3. ❌ Atualizar TODOS os links href em TODOS os arquivos
4. ❌ Atualizar TODOS os src de scripts/styles
5. ❌ Testar todas as páginas

## 💡 Recomendação

**Manter a estrutura atual** porque:
- ✅ Funciona perfeitamente
- ✅ Todos os links estão corretos
- ✅ Fácil de deployar
- ✅ index.html na raiz é padrão web

**OU** fazer a reorganização em uma fase dedicada de refatoração quando houver tempo.

## 📋 Arquivos por Categoria (Referência)

### Autenticação
- `login.html` - Login de usuários
- `register.html` - Registro de novos usuários

### Gamificação
- `dashboard.html` - ⭐ **NOVO** - Painel do usuário
- `leaderboard.html` - Rankings globais/semanal/amigos
- `shop.html` - Loja de itens e boosts
- `friends.html` - Sistema de amigos

### Lições
- `daily-lesson.html` - Lição diária
- `practice-lesson.html` - Prática de lições
- `placement-test.html` - Teste de nivelamento (OBRIGATÓRIO para novos usuários)

### Principal
- `index.html` - Hub principal com games, lessons e achievements

## ✨ Novidades Implementadas

1. **Dashboard Completo** (`dashboard.html`)
   - Estatísticas do usuário (Level, XP, Moedas, Streak)
   - Banner de alerta para placement test
   - Atalhos rápidos para todas as seções

2. **Verificação de Placement Test**
   - Popup automático no `index.html`
   - Banner visível no `dashboard.html`
   - 100 moedas de recompensa ao completar

3. **Navegação Melhorada**
   - Link "Dashboard" adicionado ao menu principal
   - Todas as páginas acessíveis de qualquer lugar
