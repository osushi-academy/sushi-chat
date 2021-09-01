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

### 2. パッケージのインストール
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
