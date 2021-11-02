#!/bin/bash

cd /app || exit 1

yarn build:shared
yarn build:server --outDir /dist

cp app/server/.env /dist/.env
