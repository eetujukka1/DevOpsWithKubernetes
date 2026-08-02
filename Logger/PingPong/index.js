import express from 'express';
import { PrismaClient } from '@prisma/client';

const app = express();
const port = process.env.PORT || 3000;
const prisma = new PrismaClient();

app.get("/", async (_req, res) => {
    try {
        const result = await prisma.counter.upsert({
            where: {
                name: "pingpong",
            },
            update: {
                value: {
                    increment: 1,
                },
            },
            create: {
                name: "pingpong",
                value: 1,
            },
        });

        res.send(String(result.value));
    } catch (error) {
        console.error("Failed to update pingpong count", error);
        res.status(500).send("database error");
    }
});

prisma.$connect()
    .then(() => {
        app.listen(port, () => {
            console.log(`HTTP server listening on port ${port}`);
        });
    })
    .catch((error) => {
        console.error("Failed to connect to database", error);
        process.exit(1);
    });
