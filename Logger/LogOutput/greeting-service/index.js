import express from 'express';

const app = express();
const port = process.env.PORT || 3000;

app.get('/', (_req, res) => {
    const line = `greetings: ${process.env.GREETING || 'Hello from version 1'}`;

    res.type('text/plain').send(line);
});

app.listen(port, () => {
    console.log(`HTTP server listening on port ${port}`);
});
