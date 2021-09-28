<template>
  <Modal
    name="home-creation-completed-modal"
    class="home-creation-completed-modal"
    :click-to-close="false"
    @before-open="beforeOpen"
  >
    <template #title
      >「<b>{{ title }}</b
      >」が作成されました</template
    >
    <template #content>
      <!-- <section class="home-creation-completed-modal__event-name">
        イベント名：
      </section> -->
      <!-- <section class="home-creation-completed-modal__event-detail">
        <div class="home-creation-completed-modal__event-detail--description">
          <NuxtLink :to="'/?user=admin&roomId=' + roomId"
            >イベントページをみる→</NuxtLink
          >
        </div>
        <div class="home-creation-completed-modal__event-detail--additional">
          （イベントページはマイページからも確認できます）
        </div>
      </section> -->
      <section
        class="home-creation-completed-modal__invitation"
        style="margin-bottom: 1rem"
      >
        <div class="home-creation-completed-modal__invitation--title">
          🍣 参加者URL
        </div>
        <div class="home-creation-completed-modal__invitation__content">
          <!-- <div
            class="home-creation-completed-modal__invitation__content--title"
          >
            招待リンク
          </div> -->
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
              <CheckIcon v-if="copyCompleted" class="check-icon"></CheckIcon>
              <CopyIcon v-else></CopyIcon>
              <!-- <span v-if="copyCompleted" class="material-icons"> done </span> -->
              <!-- <span v-else class="material-icons"> content_copy </span> -->
            </button>
          </div>
        </div>
      </section>
      <section class="home-creation-completed-modal__invitation">
        <div class="home-creation-completed-modal__invitation--title">
          🍣 共同管理者の招待URL
        </div>
        <div class="home-creation-completed-modal__invitation__content">
          <!-- <div
            class="home-creation-completed-modal__invitation__content--title"
          >
            招待リンク
          </div> -->
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
              <CheckIcon
                v-if="copyAdminCompleted"
                class="check-icon"
              ></CheckIcon>
              <CopyIcon v-else></CopyIcon>
            </button>
          </div>
        </div>
      </section>
    </template>
    <template #hide-button>
      <div class="home-creation-completed-modal__footer">
        <NuxtLink to="/home" class="hide-button"> マイページに戻る </NuxtLink>
        <NuxtLink
          :to="'/?user=admin&roomId=' + roomId"
          class="room-access-button"
          >ルームを見る</NuxtLink
        >
      </div>
    </template>
  </Modal>
</template>

<script lang="ts">
import Vue from "vue"
import { CheckIcon, CopyIcon } from "vue-feather-icons"
import Modal from "@/components/Home/Modal.vue"

type DataType = {
  adminInviteKey: string | null
  roomId: string | null
  title: string | null
  copyCompleted: boolean
  copyAdminCompleted: boolean
}

export default Vue.extend({
  name: "HomeCreationCompletedModal",
  components: {
    Modal,
    CopyIcon,
    CheckIcon,
  },
  layout: "home",
  data(): DataType {
    return {
      adminInviteKey: null,
      roomId: null,
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
      this.roomId = event.params.id
      this.title = event.params.title
      this.adminInviteKey = event.params.adminInviteKey
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
