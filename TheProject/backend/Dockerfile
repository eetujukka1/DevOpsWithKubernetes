FROM node:22-alpine

WORKDIR /app

COPY package.json .
COPY package-lock.json .

RUN npm ci --omit=dev

COPY index.js .

CMD ["node", "index.js"]
