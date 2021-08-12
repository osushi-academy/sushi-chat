# sushi-chat
2021/04/24~04/25 [サポーターズ 技育CAMP ハッカソンvol.2](https://talent.supporterz.jp/events/4dd93ba8-1fde-477a-8706-2d17f46c1c4d/) にて、学生 4 人で開発したプロダクトです。**今後のハッカソンで実際に使っていただけることになったため継続開発中です！**

🎉🎉 上記ハッカソンで[最優秀賞](https://twitter.com/geek_pjt/status/1386253688604266496)をいただきました！

2021/05/08~05/09 サポーターズ 技育CAMP ハッカソンvol.3 で[実際に使っていただきました！](https://twitter.com/geek_pjt/status/1391344209269956610)<br>
その後のハッカソンでも使っていただいています！

🍣🍣 sushi-chatの近況をTwitterで発信しています！ → Twitterアカウントは[こちら](https://twitter.com/osushi_academy)

## 概要
ハッカソン等のプレゼンでのリアルタイムなフィードバックをより便利にするチャットアプリです。

他の参加者によるコメント投稿機能のほか、スタンプでのリアクション、質問の投稿など、プレゼンを盛り上げる役割に特化しています。

https://user-images.githubusercontent.com/65712721/125596302-f5606786-3974-4ce7-a021-0e5bebb3d1fe.mp4

## 開発期間
ハッカソン：2021/4/17 ~ 4/25

継続開発1：2021/4/26 ~ 2021/5/9

継続開発2：2021/5/10 ~

## 利用技術
- フロントエンド：TypeScript Nuxt.js Docker Vercel
- バックエンド：Node.js TypeScript express heroku
- リアルタイム通信：SocketIO
- その他：Github Discord Notion GithubActions（自動デプロイ）

## ローカルでの実行方法
### 初回のみ
ライブラリのインストール
```
yarn
```
共通パッケージのビルド
```
yarn workspace sushi-chat-shared build
```
### フロント
フロントエンドの[README](/app/front/README.md)
または
```
yarn dev:front
```
### サーバ
```
yarn dev:server
```
バックエンドの[README](/server/README.md)

### shared（必要な場合は）
```
yarn dev:shared
```

## ハッカソン資料
[ハッカソンプレゼン資料](https://docs.google.com/presentation/d/1A8hxD4WBBODAvX_OhhWMsc2PKykCHYYPn0KdOFvcwsg/edit?usp=sharing)

# おすしアカデミー
大学生・大学院生4人で組んだチームです。
おすしアカデミーのTwitterアカウントは[こちら](https://twitter.com/osushi_academy)

<table>
  <tr>
    <th>
      <a href="https://github.com/yuta-ike">
        <img src="https://github.com/yuta-ike.png" width="50px;">
      </a>
    </th>
    <td>yuta-ike・フロントエンド/バックエンド担当
      <br>
      <a href="http://twitter.com/Selria1">
        <img height="20" src="https://img.shields.io/twitter/follow/Selria1?label=Twitter&logo=twitter&style=flat">
      </a>
      <a href="https://github.com/yuta-ike">
        <img height="20" src="https://img.shields.io/github/followers/yuta-ike?label=follow&logo=github&style=flat">
      </a>
    </td>
  </tr>
  <tr>
    <th>
      <a href="https://github.com/koukiNAGATA">
        <img src="https://github.com/koukiNAGATA.png" width="50px;">
      </a>
    </th>
    <td>KoukiNAGATA・フロントエンド担当
      <br>
      <a href="http://twitter.com/cheesebeefAlter">
        <img height="20" src="https://img.shields.io/twitter/follow/cheesebeefAlter?label=Twitter&logo=twitter&style=flat">
      </a>
      <a href="https://github.com/koukiNAGATA">
        <img height="20" src="https://img.shields.io/github/followers/koukiNAGATA?label=follow&logo=github&style=flat">
      </a>
      <a href="http://qiita.com/koukiNAGATA">
        <img height="20" src="https://qiita-badge.apiapi.app/s/koukiNAGATA/contributions.svg" />
      </a>
    </td>
  </tr>
  <tr>
    <th>
      <a href="https://github.com/knknk98">
        <img src="https://github.com/knknk98.png" width="50px;">
      </a>
    </th>
    <td>かよ・フロントエンド担当
      <br>
      <a href="http://twitter.com/ky_1198">
        <img height="20" src="https://img.shields.io/twitter/follow/ky_1198?label=Twitter&logo=twitter&style=flat">
      </a>
      <a href="https://github.com/knknk98">
        <img height="20" src="https://img.shields.io/github/followers/knknk98?label=follow&logo=github&style=flat">
      </a>
    </td>
  </tr>
  <tr>
    <th>
      <a href="https://github.com/Eri-0910">
        <img src="https://github.com/Eri-0910.png" width="50px;">
      </a>
    </th>
    <td>Erina Yamakawa・バックエンド担当
      <br>
      <a href="https://github.com/Eri-0910">
        <img height="20" src="https://img.shields.io/github/followers/Eri-0910?label=follow&logo=github&style=flat">
      </a>
    </td>
  </tr>
</table>
<br>

継続開発2からはインフラ担当として新たにメンバー1名を迎え、5人体制で開発をしています。
<table>
  <tr>
    <th>
      <a href="https://github.com/TOMOFUMI-KONDO">
        <img src="https://github.com/TOMOFUMI-KONDO.png" width="50px;">
      </a>
    </th>
    <td>tomokon・インフラ担当
      <br>
      <a href="http://twitter.com/tomokon_0314">
        <img height="20" src="https://img.shields.io/twitter/follow/tomokon_0314?label=Twitter&logo=twitter&style=flat">
      </a>
      <a href="https://github.com/TOMOFUMI-KONDO">
        <img height="20" src="https://img.shields.io/github/followers/TOMOFUMI-KONDO?label=follow&logo=github&style=flat">
      </a>
    </td>
  </tr>
</table>
