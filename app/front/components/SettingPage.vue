<template>
  <div class="drawer-menu-wrapper">
    <div class="drawer-menu">
      <div class="header">
        <div class="icon-space">
          <picture class="icon-wrapper">
            <source :srcset="icon.webp" type="image/webp" />
            <img :src="icon.png" alt="" />
          </picture>
        </div>
        <div class="room-info">
          <div class="room-title">
            <p>{{ title }}</p>
          </div>
          <div class="room-url">
            <span>{{ shareUrl }}</span>
            <button
              class="material-icons copy-button"
              :disabled="
                topics.findIndex((t) => topicStateItems[t.id] === 'active') ==
                null
              "
              @click="writeToClipboard"
            >
              content_copy
            </button>
          </div>
        </div>
      </div>

      <div class="topic-list">
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
          <div class="buttons">
            <button
              v-if="topicStateItems[topic.id] != 'finished'"
              @click="clickPlayPauseButton(topic.id)"
            >
              <span class="material-icons">{{
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
              <span class="material-icons">stop</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from "vue"
import ICONS from "@/utils/icons"
import { Topic } from "@/models/contents"
import { UserItemStore, TopicStore, TopicStateItemStore } from "~/store"

export default Vue.extend({
  name: "SettingPage",
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
    shareUrl() {
      return `${location.origin}?roomId=${encodeURIComponent(this.roomId)}`
    },
    playOrPause() {
      return function (topicState: string) {
        if (topicState === "active") {
          return "pause"
        } else if (topicState === "paused" || topicState === "not-started") {
          return "play_arrow"
        } else {
          return null
        }
      }
    },
  },
  methods: {
    writeToClipboard() {
      navigator.clipboard.writeText(this.shareUrl)
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
  },
})
</script>
