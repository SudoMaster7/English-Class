import http from 'http';

console.log('🧪 Testing backend server...\n');

// Test health endpoint
const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/health',
    method: 'GET'
};

const req = http.request(options, (res) => {
    let data = '';

    res.on('data', (chunk) => {
        data += chunk;
    });

    res.on('end', () => {
        if (res.statusCode === 200) {
            console.log('✅ Server is running!');
            console.log('📍 Status:', res.statusCode);
            console.log('📦 Response:', data);
            console.log('\n🎉 Backend is ready! You can now test the API endpoints.');
        } else {
            console.log('❌ Server returned status:', res.statusCode);
            console.log('Response:', data);
        }
    });
});

req.on('error', (error) => {
    console.log('❌ Server is not running or connection failed');
    console.log('Error:', error.message);
    console.log('\n💡 Make sure the server is started with: npm run dev');
});

req.setTimeout(3000, () => {
    console.log('❌ Connection timeout');
    console.log('💡 Make sure MongoDB is connected and server started successfully');
    req.destroy();
});

req.end();
