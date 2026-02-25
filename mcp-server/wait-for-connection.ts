
import http from 'http';

let attempts = 0;
function check() {
    attempts++;
    if (attempts > 15) { // 30 seconds max
        console.log('TIMEOUT');
        process.exit(1);
    }
    const req = http.request({
        hostname: 'localhost',
        port: 9600,
        path: '/selection', // This endpoint checks connection internally
        method: 'GET'
    }, (res) => {
        let data = '';
        res.on('data', c => data += c);
        res.on('end', () => {
            if (res.statusCode === 200) {
                console.log('CONNECTED');
                process.exit(0);
            } else {
                // If 500 and message is "Nivo plugin is not connected", keep waiting
                if (data.includes("not connected")) {
                     console.log('WAITING...');
                     setTimeout(check, 2000);
                } else {
                     // If other error (timeout), it means connected but slow? No, timeout means connected but unresponsive.
                     // But /selection checks connection first.
                     // If it times out, it means plugin IS connected but controller not responding.
                     // So we consider that CONNECTED for now?
                     // No, let's wait for 200 OK.
                     console.log('WAITING (Timeout)...');
                     setTimeout(check, 2000);
                }
            }
        });
    });
    req.on('error', () => {
        console.log('ERROR (Server down?)');
        setTimeout(check, 2000);
    });
    req.end();
}

console.log('Polling for connection...');
check();
