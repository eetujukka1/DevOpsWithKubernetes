import axios from 'axios';
import express from 'express';
import fs from 'fs';
import path from 'path';

const app = express();
const port = process.env.PORT || 3000;

const string = crypto.randomUUID();

app.get('/', async (_req, res) => {
    const timestamp = new Date().toISOString();
    const firstLine = `${timestamp} ${string}\n`;

    const result = await axios.get("http://pingpong-svc:6789")

    const secondLine = `Ping / Pongs: ${result.data}`

    res.type('text/plain').send(`${firstLine}\n${secondLine}`);
});


app.listen(port, () => {
  console.log(`HTTP server listening on port ${port}`);
});
