# サーバー

## 起動方法

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
