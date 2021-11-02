#!/bin/bash

cd /out/app/server || exit 1
NODE_ENV=production node --require dotenv/config ./dist/src/app.js >/var/log/app/info.log 2>/var/log/app/error.log </dev/null &
