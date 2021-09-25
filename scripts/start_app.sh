#!/bin/bash

cd /app/app/server || exit 1
NODE_ENV=production sudo -u app yarn start:server >/var/log/app/info.log 2>/var/log/app/error.log </dev/null &
