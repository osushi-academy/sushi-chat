FROM node:14.18.2-alpine3.14

WORKDIR /src

COPY package.json ./
COPY yarn.lock ./
RUN mkdir -p ./app/server ./app/shared
COPY app/server/package.json ./app/server/
COPY app/shared/package.json ./app/shared/

RUN yarn install

COPY tsconfig.json ./
COPY app/server ./app/server/
COPY app/shared ./app/shared/

RUN yarn build:shared && yarn build:server

ENV NODE_ENV=production

EXPOSE 7000

CMD ["yarn", "start:server"]
