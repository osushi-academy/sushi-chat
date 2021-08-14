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
                topics.findIndex((t) => topicStates[t.id] === 'active') == null
              "
              @click="writeToClipboard"
            >
              content_copy
            </button>
          </div>
        </div>
      </div>

      <button
        v-if="myIconId === 0"
        class="next-topic-button"
        @click="clickNextTopicButton"
      >
        <span class="material-icons"> fast_forward </span>
        次のトピックに遷移
      </button>

      <div class="topic-list">
        <div
          v-for="(topic, index) in topics"
          :key="topic.id"
          class="topic"
          :class="topicStates[topic.id]"
        >
          <div class="topic-number">{{ index }}</div>
          <div class="topic-name">
            {{ topic.title
            }}<span v-if="topicStates[topic.id] === 'active'" class="label"
              >進行中</span
            >
            <span v-if="topicStates[topic.id] === 'paused'" class="label"
              >一時停止</span
            >
          </div>
          <div v-if="myIconId === 0" class="buttons">
            <button
              v-if="topicStates[topic.id] != 'finished'"
              @click="clickPlayPauseButton(topic.id)"
            >
              <span class="material-icons">{{
                playOrPause(topicStates[topic.id])
              }}</span>
            </button>
            <button
              v-if="
                topicStates[topic.id] === 'active' ||
                topicStates[topic.id] === 'paused'
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
import Vue, { PropOptions } from "vue"
import ICONS from "@/utils/icons"
import { TopicStatesPropType, Topic } from "@/models/contents"
import { UserItemStore, TopicStore } from "~/store"

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
    topicStates: {
      type: Object,
      required: true,
    } as PropOptions<TopicStatesPropType>,
  },
  computed: {
    topics(): Topic[]{
      return TopicStore.topics
    },
    myIconId() {
      return UserItemStore.userItems.myIconId
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
      if (this.topicStates[topicId] === "active") {
        this.$emit("change-topic-state", topicId, "paused")
      } else if (this.topicStates[topicId] === "paused") {
        this.$emit("change-topic-state", topicId, "active")
      } else if (this.topicStates[topicId] === "not-started") {
        this.$emit("change-topic-state", topicId, "active")
      }
    },
    clickFinishButton(topicId: string) {
      if (
        confirm("本当にこのトピックを終了しますか？この操作は取り消せません")
      ) {
        this.topicStates[topicId]! = "finished"
        this.$emit("change-topic-state", topicId, "closed")
      }
    },
    clickNextTopicButton() {
      // アクティブなトピックを探す
      const currentActiveTopicIndex = this.topics.findIndex(
        (t) => this.topicStates[t.id] === "active",
      )

      if (currentActiveTopicIndex == null) {
        return
      }

      const nextTopic = this.topics?.[currentActiveTopicIndex + 1]

      if (nextTopic != null) {
        this.$emit("change-topic-state", nextTopic.id, "active")
      }
    },
  },
})
</script>
