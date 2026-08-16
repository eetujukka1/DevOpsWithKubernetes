FROM node:22-alpine

WORKDIR /usr/src/app

COPY package.json .
COPY package-lock.json .

RUN npm ci --omit=dev

COPY . .

CMD ["npm", "start"]
