
import http from 'http';

const options = {
    hostname: 'localhost',
    port: 9600,
    path: '/selection',
    method: 'GET',
    headers: {
        'Content-Type': 'application/json',
    },
};

const req = http.request(options, (res) => {
    let data = '';
    res.on('data', (chunk) => {
        data += chunk;
    });
    res.on('end', () => {
        console.log(data);
    });
});

req.on('error', (e) => {
    console.error(`problem with request: ${e.message}`);
});

req.end();
