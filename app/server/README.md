# サーバー

## 前提条件
- dockerが起動している
- docker-composeコマンドをインストール済
- psqlコマンドをインストール済

## 事前準備

### 1. DBの準備

DockerのPostgreSQLコンテナを使う。

```
./app/server/setup.sh
```

を実行すればDBコンテナを立ち上げて初期設定をしてくれる。

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
docker-compose --env-file app/server/.env up server nginx db
```


必要に応じて以下の環境変数を設定してください

| 環境変数名             | 内容                   | 例                                       |
|-------------------|----------------------|-----------------------------------------|
| SOCKET_IO_ADAPTER | Socket.IOのadapterを指定 | redis                                   |
| PORT              | listenするport         | 7000                                    |
| CORS_ORIGIN       | サーバーに接続するフロントのURL    | http://localhost:3000                   |
| DB_SSL            | DB接続にSSLを使用するか       | OFF                                     |
| DATABASE_URL      | DBの接続先               | postgres://sushi:chat@localhost:5432/db |

※サーバー側のlistenするportをデフォルトの7000以外にした場合は、frontを起動するときに`API_BASE_URL`の環境変数を指定して接続先のサーバーを指定する必要があります

## ビルド

```
docker-compose build
```

## テスト

```
docker-compose up server_test db_test
```

## デプロイ

mainブランチにマージされると<https://api.sushi-chat.com>にデプロイされる。
