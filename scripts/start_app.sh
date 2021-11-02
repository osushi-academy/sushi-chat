#!/bin/bash

NODE_ENV=production node --require dotenv/config /out/app/server/dist/src/app.js >/var/log/app/info.log 2>/var/log/app/error.log </dev/null &
