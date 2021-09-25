<template>
  <div class="drawer-menu-wrapper">
    <div class="drawer-menu">
      <div class="drawer-menu__header">
        <div class="room-info">
          <div class="room-title">
            <!-- {{ topics }}
            {{ topicStateItems }} -->
            <p>管理者ツール - {{ title }}</p>
          </div>
          <div class="room-url">
            <button @click="writeToClipboard(shareUrl)">
              <div class="room-text">参加者用<br />招待URLのコピー</div>
              <div class="material-icons copy-button">content_copy</div>
            </button>
            <button @click="writeToClipboard(adminUrl)">
              <div class="room-text">管理者用<br />招待URLのコピー</div>
              <div class="material-icons copy-button">content_copy</div>
            </button>
          </div>
        </div>
        <button v-if="isNotRoomStarted" class="start-button" @click="startRoom">
          <div class="material-icons-outlined">play_circle</div>
          <span>ルームを開始する</span>
        </button>
      </div>

      <div class="drawer-menu__topic-list">
        <div
          v-for="(topic, index) in topics"
          :key="topic.id"
          class="topic"
          :class="
            topicStateItems[topic.id]
              ? topicStateItems[topic.id]
              : 'not-started'
          "
        >
          <div class="topic-number">{{ index }}</div>
          <div class="topic-name">
            {{ topic.title }}
            <span v-if="topicStateItems[topic.id] === 'ongoing'" class="label">
              進行中
            </span>
            <span v-if="topicStateItems[topic.id] === 'paused'" class="label">
              一時停止
            </span>
          </div>
          <div v-if="isRoomOngoing" class="buttons">
            <button
              v-if="topicStateItems[topic.id] !== 'finished'"
              @click="clickPlayPauseButton(topic.id)"
            >
              <span class="material-icons-outlined">
                {{ playOrPause(topicStateItems[topic.id]) }}
              </span>
            </button>
            <button
              v-if="
                topicStateItems[topic.id] === 'ongoing' ||
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
            <div v-if="isRoomOngoing || isRoomFinished" class="topic-infos">
              <div class="topic-info">
                334<span class="text-mini">comments</span>
              </div>
              <div class="topic-info">
                334<span class="text-mini">stamps</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="drawer-menu__footer">
        <button v-if="isRoomOngoing" class="end-button" @click="finishRoom">
          <span>ルームを終了する</span>
          <div class="material-icons-outlined danger">info</div>
        </button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from "vue"
import { Topic } from "sushi-chat-shared"
import ICONS from "@/utils/icons"
import { UserItemStore, TopicStore, TopicStateItemStore } from "~/store"

export default Vue.extend({
  name: "AdminTool",
  props: {
    roomId: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      default: "",
    },
    roomState: {
      type: String,
      required: true,
    },
  },
  computed: {
    isNotRoomStarted(): boolean {
      return this.roomState === "not-started"
    },
    isRoomOngoing(): boolean {
      return this.roomState === "ongoing"
    },
    isRoomFinished(): boolean {
      return this.roomState === "finished"
    },
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
        if (topicState === "ongoing") {
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
      this.$emit("start-room")
    },
    // ルーム終了
    finishRoom() {
      if (confirm("本当にこのルームを終了しますか？この操作は取り消せません")) {
        this.$emit("finish-room")
      }
    },
    writeToClipboard(s: string) {
      navigator.clipboard.writeText(s)
    },
    clickPlayPauseButton(topicId: number) {
      if (this.topicStateItems[topicId] === "ongoing") {
        // ongoingならばpausedに
        this.$emit("change-topic-state", topicId, "paused")
      } else if (
        this.topicStateItems[topicId] === "paused" ||
        this.topicStateItems[topicId] === "not-started"
      ) {
        // paused, not-startedならばongoingに
        this.$emit("change-topic-state", topicId, "ongoing")
      }
    },
    clickFinishButton(topicId: number) {
      TopicStateItemStore.change({ key: `${topicId}`, state: "finished" })
      this.$emit("change-topic-state", topicId, "finished")
    },
    clickRestartButton(topicId: number) {
      TopicStateItemStore.change({ key: `${topicId}`, state: "finished" })
      this.$emit("change-topic-state", topicId, "ongoing")
    },
  },
})
</script>
