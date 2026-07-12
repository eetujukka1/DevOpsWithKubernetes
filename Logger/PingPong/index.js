import express from 'express';
import fs from 'fs';
import path from 'path';

const app = express();
const port = process.env.PORT || 3000;

const directory = path.join('/', 'usr', 'src', 'app', 'files');
const filePath = path.join(directory, 'pingpong.txt');

fs.mkdirSync(directory, { recursive: true });

app.get("/", (_req, res) => {
    let requests = 0;

    if (fs.existsSync(filePath)) {
        requests = parseInt(fs.readFileSync(filePath, "utf8"), 10) || 0;
    }

    requests++;
    fs.writeFileSync(filePath, String(requests));
    res.send(requests);
});

app.listen(port, () => {
    console.log(`HTTP server listening on port ${port}`);
});
