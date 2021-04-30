# sushi-chat

20210424~0425 サポーターズハッカソン

## 起動

### フロント

1. Docker コンテナ立ち上げ

docker-compose.yml があるパスで`$ docker-compose up`

2. ブラウザでアクセス
   `http://localhost:3000`

### サーバー

#### リモート

/serverで

`npm install`で必要なもの入れる

`npm run dev`して適当なところにアクセス

#### heroku

main に pull-request すれば以下にデプロイされるはず
<https://sushi-chat-server.herokuapp.com>

手動のデプロイは一番上のディレクトリで`git subtree --prefix server push heroku main`
