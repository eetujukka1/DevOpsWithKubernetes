import crypto from 'crypto';
import axios from 'axios';
import express from 'express';
import { readFileSync } from 'fs';
import path from 'path';

const app = express();
const port = process.env.PORT || 3000;

const directory = path.join('/', 'app', 'config');
const filePath = path.join(directory, 'information');

const string = crypto.randomUUID();

app.get('/', async (_req, res) => {
    const firstLine = `file content: ${readFileSync(filePath, 'utf8').trim()}`;
    const secondLine = `env variable: MESSAGE=${process.env.MESSAGE}`;

    const timestamp = new Date().toISOString();
    const thirdLine = `${timestamp} ${string}`;

    const result = await axios.get('http://pingpong-svc:6789');

    const fourthLine = `Ping / Pongs: ${result.data}`;

    res.type('text/plain').send(`${firstLine}\n${secondLine}\n${thirdLine}\n${fourthLine}`);
});


app.listen(port, () => {
  console.log(`HTTP server listening on port ${port}`);
});
