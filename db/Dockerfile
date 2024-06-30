FROM node:lts-alpine

WORKDIR /app

COPY index.mjs .
COPY package.json .
COPY package-lock.json .

RUN npm install
RUN npm install -g @triplit/cli


CMD ["node", "index.mjs"]