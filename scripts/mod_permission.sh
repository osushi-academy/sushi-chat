#!/bin/bash

cd /app/app/server || exit 1
chmod -R 700 dist && chown -R app:app dist
