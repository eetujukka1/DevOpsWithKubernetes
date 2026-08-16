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

app.get("/count", async (_req, res) => {
    try {
        const counter = await prisma.counter.findUnique({
            where: {
                name: "pingpong",
            },
        });

        res.send(String(counter?.value ?? 0));
    } catch (error) {
        console.error("Failed to read pingpong count", error);
        res.status(500).send("database error");
    }
});

app.get("/healthz", async (_req, res) => {
    try {
        await prisma.$queryRaw`SELECT 1`;
        res.sendStatus(200);
    } catch (error) {
        console.error("Database readiness check failed", error);
        res.sendStatus(503);
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
