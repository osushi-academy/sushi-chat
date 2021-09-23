<template>
  <div class="home-top">
    <header class="home-top__header">マイページ</header>
    <section class="home-top__new-event">
      <button class="home-top__new-event--button">
        <NuxtLink to="/room/create">
          <span class="material-icons"> add </span>新しいイベントを追加
        </NuxtLink>
      </button>
    </section>
    <section class="home-top__event">
      <div class="home-top__event--title">開催中のイベント</div>
      <div class="home-top__event__list">
        <div class="home-top__event__list--name">技育ハッカソン vol7</div>
        <div class="home-top__event__list--date">2021/8/13</div>
        <div class="home-top__event__list--role">共同管理者</div>
      </div>
    </section>
    <section class="home-top__event">
      <div class="home-top__event--title">未開始のイベント</div>
      <div class="home-top__event__list">
        <div class="home-top__event__list--name">技育ハッカソン vol8</div>
        <div class="home-top__event__list--date">2021/8/13</div>
        <div class="home-top__event__list--role">共同管理者</div>
      </div>
    </section>
    <section class="home-top__event">
      <div class="home-top__event--title">終了済みのイベント</div>
      <div class="home-top__event__list">
        <div class="home-top__event__list--name">技育ハッカソン vol1</div>
        <div class="home-top__event__list--date">2021/8/13</div>
        <div class="home-top__event__list--role">管理者</div>
        <div class="home-top__event__list--status">
          <div class="home-top__event__list--status--label">公開停止</div>
        </div>
      </div>
      <div class="home-top__event__list">
        <div class="home-top__event__list--name">
          技育ハッカソンああああああ vol2
        </div>
        <div class="home-top__event__list--date">2021/8/13</div>
        <div class="home-top__event__list--role">共同管理者</div>
        <div class="home-top__event__list--status">
          <div class="home-top__event__list--status--label">公開停止</div>
        </div>
      </div>
      <div class="home-top__event__list">
        <div class="home-top__event__list--name">技育ハッカソン vol3</div>
        <div class="home-top__event__list--date">2021/8/13</div>
        <div class="home-top__event__list--role">管理者</div>
        <div class="home-top__event__list--status">
          <div class="home-top__event__list--status--label">公開停止</div>
        </div>
      </div>
    </section>
    <section class="home-top__inquiry">
      <div class="home-top__inquiry--title">お問い合わせ</div>
      <div class="home-top__inquiry--content">
        <a href="/">Google Form</a> または <a href="/">Twitter</a>のDM
      </div>
    </section>
    <section class="home-top__account">
      <div class="home-top__account--title">アカウント</div>
      <div class="home-top__account--content">
        <div class="home-top__account--name">
          <div class="home-top__account--name--description">
            ログイン中のアカウント：
          </div>
          <div class="home-top__account--name--mail">
            sushi-chat@example.com
          </div>
        </div>
        <div class="home-top__account--logout-button">ログアウト</div>
      </div>
    </section>
    <section class="home-top__other">
      <div class="home-top__other--title">その他</div>
      <div class="home-top__other--delete-button">アカウント削除</div>
    </section>
  </div>
</template>

<script lang="ts">
import Vue from "vue"
import { DeviceStore } from "~/store"

export default Vue.extend({
  name: "Home",
  layout: "home",
  mounted(): void {
    DeviceStore.determineOs()
  },
})
</script>
