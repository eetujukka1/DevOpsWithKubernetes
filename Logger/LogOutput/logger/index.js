import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

const string = crypto.randomUUID();

const directory = path.join('/', 'usr', 'src', 'app', 'files');
const filePath = path.join(directory, 'log.txt');

fs.mkdirSync(directory, { recursive: true });

setInterval(() => {
  const timestamp = new Date().toISOString();
  const line = `${timestamp} ${string}\n`;

  fs.appendFile(filePath, line, (err) => {
    if (err) {
      console.error('Failed to write to log:', err);
    }
  });
}, 5000);