# サーバー

## 事前準備

### 1. DBの準備

1. ローカルでPostgreSQLのサーバーが起動していることを確認する
  - ない場合はインストールして起動する(https://www.postgresql.org/download/)
2. 起動しているPostgreSQLのサーバーのURIを控えておく
  - 例：`postgres://<user>:<password>@<host>:<port>/<database>`
3. 2の手順でで確認したユーザーでPostgreSQLに接続し、`server/src/database/ini.sql`のCREATE TABLEを実行する
  - 例：`psql -f app/server/src/database/ini.sql <PostgreSQLのURI>`
4. 環境変数に`DB_SSL=OFF DATABASE_URL=<PostgreSQLのURI>`を設定しておく(サーバーの起動時やテストの実行時に渡してもよい)

### 2. Redisの準備
※ローカル環境で複数サーバーを立てるときのみ必要な設定です

`localhost:6379`でRedisサーバーを立ち上げてください

docker-compose.ymlの例↓
```docker-compose.yml
version: "3"

services:
  redis:
    image: redis
    ports:
      - 6379:6379
```

### 3. パッケージのインストール
```
yarn install
```


## ローカルでの起動方法

```
yarn dev:server
```

または

```
cd app/server/
yarn dev
```

必要に応じて以下の環境変数を設定してください

| 環境変数名 | 内容 | 例 |
| --- | --- | --- |
| SOCKET_IO_ADAPTER | Socket.IOのadapterを指定 | redis |
| PORT | listenするport | 7000 |
| CORS_ORIGIN| サーバーに接続するフロントのURL | http://localhost:3000 |
| DB_SSL | DB接続にSSLを使用するか | OFF |
| DATABASE_URL | DBの接続先 | postgres://sushi:chat@localhost:5432/db

※サーバー側のlistenするportをデフォルトの7000以外にした場合は、frontを起動するときに`API_BASE_URL`の環境変数を指定して接続先のサーバーを指定する必要があります

### 複数サーバーを立てる場合のコマンド例
```
PORT=7000 DB_SSL=OFF DATABASE_URL=postgres://<username>@localhost:5432/<dbname> SOCKET_IO_ADAPTER=redis yarn dev:server
PORT=7001 DB_SSL=OFF DATABASE_URL=postgres://<username>@localhost:5432/<dbname> SOCKET_IO_ADAPTER=redis yarn dev:server
PORT=3000 API_BASE_URL=http://localhost:7000 yarn dev:front
PORT=3001 API_BASE_URL=http://localhost:7001 yarn dev:front
```

## ビルド

0. ディレクトリに移動
   ```
   cd app/server/
   ```
1. ビルド

   ```
   yarn build
   ```

2. ビルドファイルを実行
   ```
   yarn start
   ```

## テスト

0. ディレクトリに移動
   ```
   cd app/server/
   ```
1. 全てのテストを実行する

   ```
   yarn test
   ```

2. 部分的にテストを実行する
   ```
   yarn test -- ./path/to/testfile.ts
   ```
   例
   ```
   yarn test -- ./src/__test__/chat.ts
   ```

## デプロイ

main に pull-request すれば以下にデプロイされるはず

<https://sushi-chat-server.herokuapp.com>

手動のデプロイは一番上のディレクトリで

```
git subtree --prefix server push heroku main
```
