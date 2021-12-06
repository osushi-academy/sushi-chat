#!/bin/bash

cd /app || exit 1

yarn build:shared

mkdir -p /out/app/server
cp -r node_modules /out
cp -r app/server/node_modules /out/app/server
yarn build:server --outDir /out/app/server/dist

cp app/server/.env /out/app/server/.env
