FROM node:22-alpine

WORKDIR /app

COPY package.json .
COPY package-lock.json .

RUN npm ci --omit=dev

COPY prisma ./prisma
COPY index.js .
COPY start.sh .

RUN npx prisma generate

CMD ["sh", "./start.sh"]
