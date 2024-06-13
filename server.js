const http = require('http');
const fs = require('fs');
const path = require('path');
const EventEmitter = require('events');

class MyEmitter extends EventEmitter {}
const myEmitter = new MyEmitter();

function logRequest(req) {
    const logMessage = `${new Date().toISOString()} - ${req.method} ${req.url}\n`;
    console.log(logMessage);
    fs.appendFile('server.log', logMessage, (err) => {
        if (err) throw err;
    });
}

function serveFile(filePath, res) {
    fs.readFile(filePath, (err, data) => {
        if (err) {
            myEmitter.emit('fileNotFound', filePath);
            res.writeHead(404, {'Content-Type': 'text/html'});
            res.end('404 Not Found');
        } else {
            myEmitter.emit('fileReadSuccess', filePath);
            res.writeHead(200, {'Content-Type': 'text/html'});
            res.end(data);
        }
    });
}

myEmitter.on('routeAccessed', (route) => {
    console.log(`Route accessed: ${route}`);
});

myEmitter.on('fileReadSuccess', (filePath) => {
    console.log(`File successfully read: ${filePath}`);
});

myEmitter.on('fileNotFound', (filePath) => {
    console.log(`File not found: ${filePath}`);
});

const server = http.createServer((req, res) => {
    logRequest(req);

    myEmitter.emit('routeAccessed', req.url);
    
    let filePath = '';
    switch (req.url) {
        case '/about':
            filePath = path.join(__dirname, 'views', 'about.html');
            break;
        case '/contact':
            filePath = path.join(__dirname, 'views', 'contact.html');
            break;
        case '/products':
            filePath = path.join(__dirname, 'views', 'products.html');
            break;
        case '/subscribe':
            filePath = path.join(__dirname, 'views', 'subscribe.html');
            break;
        default:
            filePath = path.join(__dirname, 'views', 'index.html');
            break;
    }
    
    serveFile(filePath, res);
});

server.listen(3000, () => {
    console.log('Server running at http://localhost:3000/');
});
