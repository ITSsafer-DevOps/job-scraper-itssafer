import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { startCrawler } from './main.js';
import WebSocket from 'ws';
import http from 'http';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 3000;

// Nastavenie EJS ako šablónovacieho systému
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '..', 'views'));

// Middleware pre spracovanie formulárových dát
app.use(express.urlencoded({ extended: true }));

// Domovská stránka
app.get('/', (req, res) => {
    res.render('index');
});

// Endpoint pre spustenie scrapingu
app.post('/scrape', async (req, res) => {
    try {
        const { startUrl, maxPages, concurrency } = req.body;
        
        // Spustenie scrapera s parametrami z formulára
        const jobs = await startCrawler({
            startUrl,
            maxPages: parseInt(maxPages, 10),
            concurrency: parseInt(concurrency, 10)
        });

        res.render('index', {
            success: 'Scraping bol úspešne dokončený',
            jobs,
            hasFiles: true // Indikátor pre zobrazenie tlačidiel na stiahnutie
        });
    } catch (error) {
        res.render('index', {
            error: `Chyba pri scrapovaní: ${error.message}`
        });
    }
});

// Endpoint pre stiahnutie CSV súboru
app.get('/download/csv', (req, res) => {
    const filePath = path.join(__dirname, '..', 'output', 'jobs.csv');
    res.download(filePath, 'jobs.csv', (err) => {
        if (err) {
            res.status(404).send('Súbor sa nenašiel');
        }
    });
});

// Endpoint pre stiahnutie JSON súboru
app.get('/download/json', (req, res) => {
    const filePath = path.join(__dirname, '..', 'output', 'jobs.json');
    res.download(filePath, 'jobs.json', (err) => {
        if (err) {
            res.status(404).send('Súbor sa nenašiel');
        }
    });
});

// Vytvorenie HTTP servera
const server = http.createServer(app);

// WebSocket server
const wss = new WebSocket.Server({ server });

// Uloženie všetkých aktívnych WebSocket spojení
const clients = new Set();

// WebSocket spojenia
wss.on('connection', (ws) => {
    clients.add(ws);
    
    ws.on('close', () => {
        clients.delete(ws);
    });
});

// Funkcia na posielanie správ všetkým klientom
const broadcastMessage = (message) => {
    clients.forEach(client => {
        if (client.readyState === 1) {
            client.send(JSON.stringify({ type: 'log', message }));
        }
    });
};

// Override pre zachytenie všetkých typov logov
function overrideConsole() {
    const methods = ['log', 'info', 'warn', 'error'];
    methods.forEach(method => {
        const original = console[method];
        console[method] = (...args) => {
            original.apply(console, args);
            const message = args.map(arg => {
                if (typeof arg === 'object') {
                    return JSON.stringify(arg, null, 2);
                }
                return arg.toString();
            }).join(' ');
            broadcastMessage({
                type: 'log',
                level: method,
                timestamp: new Date().toISOString(),
                message
            });
        };
    });
}

overrideConsole();

// Spustenie servera
server.listen(port, () => {
    console.log(`Server beží na http://localhost:${port}`);
});