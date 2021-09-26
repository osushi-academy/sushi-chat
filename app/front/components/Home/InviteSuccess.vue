<template>
  <Modal
    name="home-invite-success-modal"
    class="home-invite-success-modal"
    :click-to-close="false"
    @before-open="beforeOpen"
  >
    <template #title>管理者登録が完了しました</template>
    <template #content>
      <section class="home-creation-completed-modal__event-name">
        イベント名：<b>{{ title }}</b>
      </section>
      <section class="home-creation-completed-modal__event-detail">
        <div class="home-creation-completed-modal__event-detail--description">
          <NuxtLink :to="'/?user=admin&roomId=' + roomId"
            >イベントページをみる→</NuxtLink
          >
        </div>
        <div class="home-creation-completed-modal__event-detail--additional">
          （イベントページはマイページからも確認できます）
        </div>
      </section>
      <section
        class="home-creation-completed-modal__invitation"
        style="margin-bottom: 1rem"
      >
        <div class="home-creation-completed-modal__invitation--title">
          🍣 参加者を招待する
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
              {{ url }}
            </div>
            <button
              class="
                home-creation-completed-modal__invitation__content__detail--button
              "
              @click="copy(url, 0)"
            >
              <span v-if="copyCompleted" class="material-icons"> done </span>
              <span v-else class="material-icons"> content_copy </span>
            </button>
          </div>
        </div>
      </section>
      <section class="home-creation-completed-modal__invitation">
        <div class="home-creation-completed-modal__invitation--title">
          🍣 共同管理者を招待する
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
              {{ adminUrl }}
            </div>
            <button
              class="
                home-creation-completed-modal__invitation__content__detail--button
              "
              @click="copy(adminUrl, 1)"
            >
              <span v-if="copyAdminCompleted" class="material-icons">
                done
              </span>
              <span v-else class="material-icons"> content_copy </span>
            </button>
          </div>
        </div>
      </section>
    </template>
    <template #hide-button>
      <NuxtLink to="/home" class="home-modal__hide-button">
        マイページに戻る
      </NuxtLink>
    </template>
  </Modal>
</template>

<script lang="ts">
import Vue from "vue"
import Modal from "@/components/Home/Modal.vue"

type DataType = {
  adminInviteKey: string | null
  roomId: string | null
  description: string | null
  title: string | null
  copyCompleted: boolean
  copyAdminCompleted: boolean
}

export default Vue.extend({
  name: "InviteSuccess",
  components: {
    Modal,
  },
  layout: "home",
  data(): DataType {
    return {
      adminInviteKey: null,
      roomId: null,
      description: null,
      title: null,
      copyCompleted: false,
      copyAdminCompleted: false,
    }
  },
  computed: {
    url(): string {
      return `${location.origin}/?roomId=${this.roomId}`
    },
    adminUrl(): string {
      return `${location.origin}/invited/?roomId=${this.roomId}&admin_invite_key=${this.adminInviteKey}`
    },
  },
  methods: {
    beforeOpen(event: any) {
      this.adminInviteKey = event.params.adminInviteKey
      this.roomId = event.params.id
      this.description = event.params.description
      this.title = event.params.title
    },
    copy(s: string, idx: number) {
      navigator.clipboard.writeText(s)
      if (idx === 0) {
        this.copyCompleted = true
        setTimeout(() => {
          this.copyCompleted = false
        }, 2000)
      } else {
        this.copyAdminCompleted = true
        setTimeout(() => {
          this.copyAdminCompleted = false
        }, 2000)
      }
    },
  },
})
</script>
