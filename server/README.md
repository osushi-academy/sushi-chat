# サーバー
## 起動方法
0. サーバーのルートディレクトリに移動
    ```
    cd server
    ```

1. ライブラリのインストール（初回、ライブラリ更新時のみ）
    ```
    npm install
    ```

2. 開発サーバー起動（Hot Reload有）
    ```
    npm run dev
    ```
## ビルド
1. ビルド
   ```
   npm run build
   ```

2. ビルドファイルを実行
   ```
   npm start
   ```

## テスト
1. 全てのテストを実行する
    ```
    npm run test
    ```

2. 部分的にテストを実行する
   ```
   npm run test -- ./path/to/testfile.ts
   ```
   例
   ```
   npm run test -- ./src/__test__/chat.ts
   ```