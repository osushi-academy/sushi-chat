<template>
  <div class="drawer-menu-wrapper">
    <div class="drawer-menu">
      <div class="drawer-menu__header">
        <div class="room-info">
          <div class="room-title">
            <p>管理者ツール - {{ title }}</p>
          </div>
          <div class="room-url">
            <button @click="writeToClipboard(shareUrl)">
              <span>参加者用<br />招待URLのコピー</span>
              <div class="material-icons copy-button">content_copy</div>
            </button>
            <button @click="writeToClipboard(adminUrl)">
              <span>管理者用<br />招待URLのコピー</span>
              <div class="material-icons copy-button">content_copy</div>
            </button>
          </div>
        </div>
        <button v-if="!isRoomStarted" @click="startRoom">
          <div class="material-icons">play_circle</div>
          <span>ルームを開始する</span>
        </button>
      </div>

      <div class="drawer-menu__topic-list">
        <div
          v-for="(topic, index) in topics"
          :key="topic.id"
          class="topic"
          :class="topicStateItems[topic.id]"
        >
          <div class="topic-number">{{ index }}</div>
          <div class="topic-name">
            {{ topic.title
            }}<span v-if="topicStateItems[topic.id] === 'active'" class="label"
              >進行中</span
            >
            <span v-if="topicStateItems[topic.id] === 'paused'" class="label"
              >一時停止</span
            >
          </div>
          <div v-if="isRoomStarted" class="buttons">
            <button
              v-if="topicStateItems[topic.id] != 'finished'"
              @click="clickPlayPauseButton(topic.id)"
            >
              <span class="material-icons-outlined">{{
                playOrPause(topicStateItems[topic.id])
              }}</span>
            </button>
            <button
              v-if="
                topicStateItems[topic.id] === 'active' ||
                topicStateItems[topic.id] === 'paused'
              "
              @click="clickFinishButton(topic.id)"
            >
              <span class="material-icons-outlined danger">stop_circle</span>
            </button>
            <button
              v-if="topicStateItems[topic.id] === 'finished'"
              @click="clickRestartButton(topic.id)"
            >
              <span class="material-icons">restart_alt</span>
            </button>
            <div>334users</div>
            <div>334comments</div>
            <div>334stamps</div>
          </div>
        </div>
      </div>
      <div class="drawer-menu__footer">
        <button v-if="!isRoomStarted" @click="endRoom">
          <span>ルームを終了する</span>
          <div class="material-icons-outlined danger">info</div>
        </button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from "vue"
import ICONS from "@/utils/icons"
import { Topic } from "@/models/contents"
import socket from "~/utils/socketIO"
import { UserItemStore, TopicStore, TopicStateItemStore } from "~/store"

// Data型
type DataType = {
  isRoomStarted: boolean
}

export default Vue.extend({
  name: "AdminTool",
  props: {
    roomId: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
  },
  data(): DataType {
    return {
      isRoomStarted: false,
    }
  },
  computed: {
    topics(): Topic[] {
      return TopicStore.topics
    },
    topicStateItems() {
      return TopicStateItemStore.topicStateItems
    },
    icon() {
      return ICONS[UserItemStore.userItems.myIconId] ?? ICONS[0]
    },
    adminUrl(): string {
      return `${location.origin}?user=admin&roomId=${encodeURIComponent(
        this.roomId,
      )}`
    },
    shareUrl(): string {
      return `${location.origin}?roomId=${encodeURIComponent(this.roomId)}`
    },
    playOrPause() {
      return function (topicState: string) {
        if (topicState === "active") {
          return "pause_circle"
        } else if (topicState === "paused" || topicState === "not-started") {
          return "play_circle"
        } else {
          return null
        }
      }
    },
  },
  methods: {
    // ルーム開始
    startRoom() {
      socket.emit("ADMIN_START_ROOM", { roomId: this.roomId })
      this.isRoomStarted = true
    },
    // ルーム終了
    endRoom() {
      // TODO:ルーム終了
    },
    writeToClipboard(s: string) {
      navigator.clipboard.writeText(s)
    },
    clickPlayPauseButton(topicId: string) {
      if (this.topicStateItems[topicId] === "active") {
        this.$emit("change-topic-state", topicId, "paused")
      } else if (
        this.topicStateItems[topicId] === ("paused" || "not-started")
      ) {
        this.$emit("change-topic-state", topicId, "active")
      }
    },
    clickFinishButton(topicId: string) {
      if (
        confirm("本当にこのトピックを終了しますか？この操作は取り消せません")
      ) {
        TopicStateItemStore.change({ key: topicId, state: "finished" })
        this.$emit("change-topic-state", topicId, "closed")
      }
    },
    clickRestartButton(topicId: string) {
      TopicStateItemStore.change({ key: topicId, state: "finished" })
      this.$emit("change-topic-state", topicId, "active")
    },
  },
})
</script>
