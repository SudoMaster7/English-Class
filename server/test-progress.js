import http from 'http';

console.log('🧪 Testando APIs de Progresso e Lições...\n');

let authToken = '';

// Test flow: Register → Login → Record Game → Complete Lesson → Get Stats

async function runTests() {
    try {
        // 1. Login
        console.log('1️⃣ Fazendo login...');
        const login = await makeRequest('POST', '/api/auth/login', {
            email: 'teste@example.com',
            password: 'Test123!'
        });

        if (login.success) {
            authToken = login.data.tokens.authToken;
            console.log('✅ Login: SUCESSO');
            console.log(`   Usuário: ${login.data.user.name}`);
            console.log(`   XP atual: ${login.data.user.xp}`);
            console.log(`   Nível: ${login.data.user.level}\n`);
        }

        // 2. Get Progress
        console.log('2️⃣ Buscando progresso...');
        const progress = await makeRequest('GET', '/api/progress');

        if (progress.success) {
            console.log('✅ Progresso: SUCESSO');
            console.log(`   Jogos registrados: ${progress.data.games.length}`);
            console.log(`   Lições completadas: ${progress.data.lessons.length}\n`);
        }

        // 3. Record Game Score
        console.log('3️⃣ Salvando score de jogo...');
        const gameResult = await makeRequest('POST', '/api/progress/game', {
            gameName: 'memory-match',
            score: 850,
            timeSpent: 45
        });

        if (gameResult.success) {
            console.log('✅ Score do jogo: SUCESSO');
            console.log(`   XP ganho: +${gameResult.data.xpEarned}`);
            console.log(`   XP total: ${gameResult.data.totalXP}`);
            console.log(`   Nível: ${gameResult.data.level}`);
            if (gameResult.data.levelUp) {
                console.log(`   🎉 LEVEL UP! Novo nível: ${gameResult.data.newLevel}`);
            }
            console.log();
        }

        // 4. Get Lessons
        console.log('4️⃣ Buscando lições disponíveis...');
        const lessons = await makeRequest('GET', '/api/lessons');

        if (lessons.success) {
            console.log('✅ Lições: SUCESSO');
            console.log(`   Total de temas: ${lessons.data.length}`);
            lessons.data.forEach(theme => {
                const unlockedCount = theme.levels.filter(l => l.unlocked).length;
                console.log(`   ${theme.icon} ${theme.themeName}: ${unlockedCount}/6 desbloqueados`);
            });
            console.log();
        }

        // 5. Start Lesson
        console.log('5️⃣ Iniciando lição...');
        const startLesson = await makeRequest('POST', '/api/lessons/travel/A1/start');

        if (startLesson.success) {
            console.log('✅ Iniciar lição: SUCESSO');
            console.log(`   ${startLesson.message}\n`);
        }

        // 6. Complete Lesson
        console.log('6️⃣ Completando lição...');
        const completeLesson = await makeRequest('POST', '/api/progress/lesson', {
            themeId: 'travel',
            level: 'A1',
            score: 95
        });

        if (completeLesson.success) {
            console.log('✅ Completar lição: SUCESSO');
            console.log(`   XP ganho: +${completeLesson.data.xpEarned}`);
            console.log(`   Estrelas: ${completeLesson.data.lesson.stars} ⭐`);
            console.log(`   Moedas ganhas: ${completeLesson.data.coins} 🪙`);
            if (completeLesson.data.levelUp) {
                console.log(`   🎉 LEVEL UP! Nível ${completeLesson.data.newLevel}`);
            }
            console.log();
        }

        // 7. Get Overall Stats
        console.log('7️⃣ Buscando estatísticas gerais...');
        const stats = await makeRequest('GET', '/api/progress/stats/overall');

        if (stats.success) {
            console.log('✅ Estatísticas: SUCESSO');
            console.log(`   Total de jogos: ${stats.data.totalGames}`);
            console.log(`   Lições completadas: ${stats.data.lessonsCompleted}`);
            console.log(`   Palavras aprendidas: ${stats.data.wordsLearned}`);
            console.log(`   Score médio: ${stats.data.averageScore}%\n`);
        }

        // 8. Review Vocabulary
        console.log('8️⃣ Revisando vocabulário (SRS)...');
        const vocabReview = await makeRequest('POST', '/api/progress/vocabulary/review', {
            word: 'hello',
            isCorrect: true
        });

        if (vocabReview.success) {
            console.log('✅ Revisão de vocabulário: SUCESSO');
            console.log(`   XP ganho: +${vocabReview.data.xpEarned}`);
            console.log(`   Proficiência: ${vocabReview.data.vocabulary.proficiency}%`);
            console.log(`   Próxima revisão: ${new Date(vocabReview.data.vocabulary.nextReview).toLocaleDateString()}\n`);
        }

        console.log('🎉 TODOS OS TESTES PASSARAM! Sistema de lições e progresso funcionando! ✨');

    } catch (error) {
        console.error('❌ Erro nos testes:', error.message);
    }
}

// Helper function to make HTTP requests
function makeRequest(method, path, body = null) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'localhost',
            port: 5000,
            path,
            method,
            headers: {
                'Content-Type': 'application/json'
            }
        };

        if (authToken) {
            options.headers['Authorization'] = `Bearer ${authToken}`;
        }

        const req = http.request(options, (res) => {
            let data = '';

            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const response = JSON.parse(data);
                    if (res.statusCode >= 200 && res.statusCode < 300) {
                        resolve(response);
                    } else {
                        reject(new Error(response.message || `HTTP ${res.statusCode}`));
                    }
                } catch (error) {
                    reject(new Error('Failed to parse response'));
                }
            });
        });

        req.on('error', reject);

        if (body) {
            req.write(JSON.stringify(body));
        }

        req.end();
    });
}

// Run tests
runTests();
