import http from 'http';

console.log('🧪 Testando backend...\n');

// Teste 1: Health Check
console.log('1️⃣ Testando endpoint /health...');
http.get('http://localhost:5000/health', (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
        console.log('✅ Health Check:', res.statusCode === 200 ? 'OK' : 'FALHOU');
        console.log('📦 Resposta:', data, '\n');

        // Teste 2: Registro de usuário
        testRegister();
    });
}).on('error', (err) => {
    console.log('❌ Servidor não está respondendo');
    console.log('Erro:', err.message);
    console.log('\n💡 Certifique-se de que o servidor está rodando com: npm run dev');
});

function testRegister() {
    console.log('2️⃣ Testando registro de usuário...');

    const postData = JSON.stringify({
        email: 'teste@example.com',
        password: 'Test123!',
        name: 'Usuário Teste'
    });

    const options = {
        hostname: 'localhost',
        port: 5000,
        path: '/api/auth/register',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(postData)
        }
    };

    const req = http.request(options, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
            const response = JSON.parse(data);

            if (res.statusCode === 201 || res.statusCode === 400) {
                console.log('✅ Registro:', res.statusCode === 201 ? 'SUCESSO' : 'Usuário já existe (OK)');
                if (response.data && response.data.tokens) {
                    console.log('🔑 Token recebido!');
                    console.log('👤 Usuário criado:', response.data.user.name);

                    // Teste 3: Login
                    testLogin(response.data.tokens.authToken);
                } else if (res.statusCode === 400) {
                    console.log('ℹ️ Usuário já existe, testando login...');
                    testLogin();
                }
            } else {
                console.log('❌ Erro no registro:', response.message);
            }
        });
    });

    req.on('error', (err) => {
        console.log('❌ Erro na requisição:', err.message);
    });

    req.write(postData);
    req.end();
}

function testLogin(existingToken) {
    console.log('\n3️⃣ Testando login...');

    const postData = JSON.stringify({
        email: 'teste@example.com',
        password: 'Test123!'
    });

    const options = {
        hostname: 'localhost',
        port: 5000,
        path: '/api/auth/login',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(postData)
        }
    };

    const req = http.request(options, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
            const response = JSON.parse(data);

            if (res.statusCode === 200) {
                console.log('✅ Login: SUCESSO');
                console.log('👤 Usuário:', response.data.user.name);
                console.log('⭐ XP:', response.data.user.xp);
                console.log('🔥 Streak:', response.data.user.streak);
                console.log('🪙 Moedas:', response.data.user.coins);

                const token = existingToken || response.data.tokens.authToken;
                testAuthenticatedEndpoint(token);
            } else {
                console.log('❌ Erro no login:', response.message);
            }
        });
    });

    req.on('error', (err) => {
        console.log('❌ Erro na requisição:', err.message);
    });

    req.write(postData);
    req.end();
}

function testAuthenticatedEndpoint(token) {
    console.log('\n4️⃣ Testando endpoint autenticado /api/auth/me...');

    const options = {
        hostname: 'localhost',
        port: 5000,
        path: '/api/auth/me',
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    };

    http.get(options, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
            if (res.statusCode === 200) {
                const response = JSON.parse(data);
                console.log('✅ Endpoint autenticado: SUCESSO');
                console.log('📊 Dados do usuário recebidos!');
                console.log('\n🎉 TODOS OS TESTES PASSARAM! Backend está funcionando perfeitamente! ✨');
            } else {
                console.log('❌ Falha na autenticação');
            }
        });
    }).on('error', (err) => {
        console.log('❌ Erro:', err.message);
    });
}
