
import http from 'http';

const structure = {
  type: "FRAME",
  name: "Test Connection",
  width: 100,
  height: 100,
  fills: [{ type: "SOLID", color: { r: 0, g: 1, b: 0 } }]
};

const data = JSON.stringify({
  action: 'create',
  structure: structure
});

const options = {
  hostname: 'localhost',
  port: 9600,
  path: '/generate',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

const req = http.request(options, (res) => {
  console.log(`STATUS: ${res.statusCode}`);
  res.setEncoding('utf8');
  res.on('data', (chunk) => {
    console.log(`BODY: ${chunk}`);
  });
});

req.on('error', (e) => {
  console.error(`problem with request: ${e.message}`);
});

req.write(data);
req.end();
