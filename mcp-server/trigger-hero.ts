
import http from "http";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const designPath = path.join(__dirname, "design.json");

try {
    const structure = JSON.parse(fs.readFileSync(designPath, 'utf8'));

    const options = {
        hostname: 'localhost',
        port: 9600,
        path: '/generate',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
    };

    const req = http.request(options, (res) => {
        console.log(`STATUS: ${res.statusCode}`);
        res.setEncoding('utf8');
        res.on('data', (chunk) => {
            console.log(`BODY: ${chunk}`);
        });
        res.on('end', () => {
            console.log('No more data in response.');
        });
    });

    req.on('error', (e) => {
        console.error(`problem with request: ${e.message}`);
    });

    // Write data to request body
    req.write(JSON.stringify(structure));
    req.end();

} catch (err) {
    console.error("Error reading design file:", err);
}
