FROM node:22-alpine

WORKDIR /app

COPY package.json .

RUN npm install

COPY index.js .
COPY index.html .

CMD ["node", "index.js"]
