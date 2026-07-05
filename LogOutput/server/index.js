import express from 'express';
import fs from 'fs';
import path from 'path';

const app = express();
const port = process.env.PORT || 3000;

const directory = path.join('/', 'usr', 'src', 'app', 'files');
const filePath = path.join(directory, 'pingpong.txt');

const string = crypto.randomUUID();

app.get('/', (_req, res) => {
    const timestamp = new Date().toISOString();
    const firstLine = `${timestamp} ${string}\n`;

    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
        console.error('Failed to read log:', err);
        res.status(500).send('Failed to read log file');
        return;
    }

    const secondLine = `Ping / Pongs: ${data}`

    res.type('text/plain').send(`${firstLine}\n${secondLine}`);
  });
});

app.listen(port, () => {
  console.log(`HTTP server listening on port ${port}`);
});
