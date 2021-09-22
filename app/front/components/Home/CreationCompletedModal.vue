<template>
  <Modal
    name="home-creation-completed-modal"
    class="home-creation-completed-modal"
    :click-to-close="false"
  >
    <template #title>イベントが作成されました</template>
    <template #content>
      <section class="home-creation-completed-modal__event-name">
        イベント名：<b>技育CAMPハッカソン</b>
      </section>
      <section class="home-creation-completed-modal__event-detail">
        <div class="home-creation-completed-modal__event-detail--description">
          <NuxtLink to="/">イベントページをみる→</NuxtLink>
        </div>
        <div class="home-creation-completed-modal__event-detail--additional">
          （イベントページはマイページからも確認できます）
        </div>
      </section>
      <section class="home-creation-completed-modal__invitation">
        <div class="home-creation-completed-modal__invitation--title">
          共同管理者を招待する
        </div>
        <div class="home-creation-completed-modal__invitation__content">
          <div
            class="home-creation-completed-modal__invitation__content--title"
          >
            招待リンク
          </div>
          <div
            class="home-creation-completed-modal__invitation__content__detail"
          >
            <div
              class="
                home-creation-completed-modal__invitation__content__detail--url
              "
            >
              https://sushi-chat.com/12345?user=admin
            </div>
            <button
              class="
                home-creation-completed-modal__invitation__content__detail--button
              "
            >
              コピーする
            </button>
          </div>
        </div>
      </section>
    </template>
    <template #hide-button>
      <NuxtLink to="/home"> マイページに戻る </NuxtLink>
    </template>
  </Modal>
</template>

<script lang="ts">
import Vue from "vue"
import Modal from "@/components/Home/Modal.vue"

export default Vue.extend({
  name: "HomeCreationCompletedModal",
  components: {
    Modal,
  },
  layout: "home",
})
</script>
