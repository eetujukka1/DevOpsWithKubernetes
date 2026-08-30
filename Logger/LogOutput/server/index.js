import crypto from 'crypto';
import axios from 'axios';
import express from 'express';
import { readFileSync } from 'fs';
import path from 'path';

const app = express();
const port = process.env.PORT || 3000;
const pingPongUrl = process.env.PINGPONG_URL || 'http://pingpong-svc:6789';
const pingPongRootUrl = new URL('/', pingPongUrl).toString();
const pingPongCountUrl = new URL('/count', pingPongUrl).toString();

const directory = path.join('/', 'app', 'config');
const filePath = path.join(directory, 'information');

const string = crypto.randomUUID();

app.get('/', async (_req, res) => {
    const firstLine = `file content: ${readFileSync(filePath, 'utf8').trim()}`;
    const secondLine = `env variable: MESSAGE=${process.env.MESSAGE}`;

    const timestamp = new Date().toISOString();
    const thirdLine = `${timestamp} ${string}`;

    const result = await axios.get(pingPongRootUrl);

    const fourthLine = `Ping / Pongs: ${result.data}`;

    const fifthLine = `greetings: ${process.env.GREETING || 'Hello from version 1'}`;

    res.type('text/plain').send(`${firstLine}\n${secondLine}\n${thirdLine}\n${fourthLine}\n${fifthLine}`);
});

app.get('/healthz', async (_req, res) => {
    try {
        const result = await axios.get(pingPongCountUrl, { timeout: 2000 });
        const body = String(result.data).trim();

        if (result.status === 200 && body.length > 0) {
            res.sendStatus(200);
            return;
        }

        res.sendStatus(503);
    } catch (error) {
        console.error('PingPong readiness check failed', error.message);
        res.sendStatus(503);
    }
});

app.listen(port, () => {
  console.log(`HTTP server listening on port ${port}`);
});
