# 🎮 English Learning Games Platform

> Uma plataforma interativa e gamificada para aprender inglês com 6 mini-games, sistema de lições temáticas, teste de nivelamento e progressão por níveis.

![Platform Preview](preview.png)

## ✨ Características

### 🎯 6 Mini-Games Interativos
- **Memory Match** - Combine pares de palavras em inglês/português
- **Word Scramble** - Desembaralhe palavras em inglês
- **Typing Challenge** - Digite sentenças rapidamente e com precisão
- **Listening Game** - Escute e escreva o que ouviu (Web Speech API)
- **Pronunciation Game** - Pratique pronúncia com reconhecimento de voz
- **Crossword Puzzle** - Palavras cruzadas em inglês

### 📚 Sistema de Lições Temáticas
- **3 Temas Completos**: Daily Routines, Travel & Tourism, Business & Work
- **6 Níveis CEFR**: A1 (Beginner) até C2 (Proficient)
- **120+ Vocabulário** com tradução e fonética
- **70+ Sentenças** para prática
- **Exercícios Aleatórios** gerados dinamicamente

### 📝 Teste de Nivelamento
- 20 questões progressivas (A1-C2)
- Avaliação automática do nível CEFR
- Recomendações personalizadas
- Resultados salvos automaticamente

### 🎯 Sistema de Progressão
- **Sistema de XP**: 1 XP a cada 10 pontos
- **Níveis Infinitos**: 100 XP = 1 nível
- **Barra de Progresso Visual** com animações
- **10 Conquistas** desbloqueáveis

### 🎨 Design Moderno
- **Dark/Light Mode** com transições suaves
- **Glassmorphism UI** com gradientes vibrantes
- **Totalmente Responsivo** (mobile-first)
- **Efeitos Sonoros** para feedback
- **Animações** suaves em todas as interações

## 🚀 Como Usar

### Localmente
1. Clone ou baixe este repositório
2. Abra `index.html` em um navegador moderno
3. Comece a jogar! (Tudo funciona sem servidor)

### Deploy Online

#### Vercel (Recomendado)
```bash
npm install -g vercel
cd aula-ingles
vercel
```

#### Netlify
```bash
npm install -g netlify-cli
cd aula-ingles
netlify deploy
```

#### GitHub Pages
1. Crie um repositório no GitHub
2. Faça push do projeto
3. Ative GitHub Pages nas configurações do repo

## 📁 Estrutura do Projeto

```
aula-ingles/
├── index.html              # Página principal
├── placement-test.html     # Teste de nivelamento
├── practice-lesson.html    # Exercícios de prática
├── css/
│   └── style.css          # Estilos principais
├── js/
│   ├── storage.js         # LocalStorage & progresso
│   ├── achievements.js    # Sistema de conquistas
│   ├── lessons.js         # Database de lições
│   └── lesson-ui.js       # UI de lições
└── games/
    ├── memory-match.html
    ├── word-scramble.html
    ├── typing-challenge.html
    ├── listening-game.html
    ├── pronunciation-game.html
    └── crossword.html
```

## 🛠️ Tecnologias

- **HTML5** - Estrutura
- **CSS3** - Estilização (Glassmorphism, Gradientes)
- **JavaScript (ES6+)** - Lógica e interatividade
- **Web Speech API** - Síntese e reconhecimento de voz
- **LocalStorage API** - Persistência de dados
- **No frameworks** - Vanilla JS puro para máxima performance

## 📊 Sistema de Dados

### Progresso do Usuário
- Jogos jogados e pontuação total
- Tempo gasto na plataforma
- Lições completadas por tema/nível
- Conquistas desbloqueadas
- Nível e XP atual

### Lições
- 3 temas × 6 níveis = 18 lições únicas
- Cada lição contém vocabulário e sentenças específicas
- Sistema de estrelas (1-3) baseado em performance
- Desbloqueio progressivo de níveis

## 🎮 Como Jogar

1. **Primeiro Acesso**:
   - Faça o teste de nivelamento para descobrir seu nível
   - Explore os jogos disponíveis
   - Escolha um tema e nível para começar

2. **Lições**:
   - Selecione um tema (Daily Routines, Travel, Business)
   - Escolha seu nível (A1-C2)
   - Clique em "Continue Learning" para praticar
   - Complete exercícios e ganhe estrelas

3. **Jogos**:
   - Cada jogo ensina de forma diferente
   - Ganhe pontos para aumentar seu XP
   - Desbloqueie conquistas

4. **Progressão**:
   - Ganhe 1 XP a cada 10 pontos
   - Suba de nível a cada 100 XP
   - Acompanhe seu progresso no dashboard

## 🏆 Conquistas

- **First Steps** - Jogue seu primeiro jogo
- **Quick Learner** - Complete um jogo em menos de 2 minutos
- **Perfect Match** - Acerte todas no Memory Match
- **Speed Demon** - 60+ WPM no Typing Challenge
- **Pronunciation Pro** - 100% no Pronunciation Game
- **Dedicated Student** - Jogue 10 partidas
- **Score Master** - Alcance 1000 pontos totais
- **Marathon Runner** - Jogue por 30 minutos
- **Polyglot** - Jogue todos os 6 jogos
- **Achievement Hunter** - Desbloqueie todas as conquistas

## 🔄 Requisitos do Navegador

- **Chrome/Edge**: ✅ Totalmente suportado
- **Firefox**: ✅ Totalmente suportado  
- **Safari**: ✅ Suportado (algumas features de voz podem variar)
- **Mobile**: ✅ Responsivo em todos os dispositivos

## 📝 Licença

Este projeto é de código aberto e está disponível para uso educacional.

## 🤝 Contribuindo

Contribuições são bem-vindas! Sinta-se à vontade para:
- Reportar bugs
- Sugerir novos recursos
- Adicionar novos temas/vocabulário
- Melhorar o design

## 🎯 Próximas Funcionalidades

Veja [ROADMAP.md](ROADMAP.md) para features planejadas.

---

**Desenvolvido com 💜 por SUDO - 2026**

*Aprenda inglês de forma divertida e interativa!* 🚀
