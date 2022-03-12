#!/bin/bash

docker-compose up -d db db_test
sleep 10

db_urls=(
  "postgres://sushi:chat@localhost:54320/sushi_chat"
  "postgres://sushi_test:chat@localhost:54321/sushi_chat_test"
)
for db_url in "${db_urls[@]}"; do
  psql -f app/server/src/database/ini.sql "$db_url"
  cat app/server/src/database/seed/* | psql -f - "$db_url"
done

docker-compose stop db db_test
