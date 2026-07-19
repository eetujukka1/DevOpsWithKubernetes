FROM node:22-alpine

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY prisma ./prisma
RUN npx prisma generate

COPY index.js .

CMD ["sh", "-c", "export DATABASE_URL=\"postgresql://${PGUSER}:${PGPASSWORD}@${PGHOST}:${PGPORT}/${PGDATABASE}?schema=public\" && until npx prisma db push; do echo 'waiting for postgres'; sleep 2; done && node index.js"]
