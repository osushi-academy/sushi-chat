# サーバー

## 起動方法

0. サーバーのルートディレクトリに移動

   ```
   cd app/server/
   ```

1. ライブラリのインストール（初回、ライブラリ更新時のみ）

   ```
   yarn
   ```

2. 開発サーバー起動（Hot Reload 有）
   ```
   yarn dev
   ```

## ビルド

1. ビルド

   ```
   yarn build
   ```

2. ビルドファイルを実行
   ```
   yarn start
   ```

## テスト

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
