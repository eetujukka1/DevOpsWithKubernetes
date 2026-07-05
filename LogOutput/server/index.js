import express from 'express';
import fs from 'fs';
import path from 'path';

const app = express();
const port = process.env.PORT || 3000;

const directory = path.join('/', 'usr', 'src', 'app', 'files');
const filePath = path.join(directory, 'log.txt');

app.get('/', (_req, res) => {
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      console.error('Failed to read log:', err);
      res.status(500).send('Failed to read log file');
      return;
    }

    res.type('text/plain').send(data);
  });
});

app.listen(port, () => {
  console.log(`HTTP server listening on port ${port}`);
});
