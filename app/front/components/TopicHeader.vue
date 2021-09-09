<template>
  <div
    class="topic-header"
    :class="{
      'finished-topic': topicState === 'finished',
      'active-topic': topicState === 'active',
    }"
  >
    <div class="main-line">
      <h1 class="title">{{ title }}</h1>
      <button
        v-show="isAdmin"
        class="download-button"
        :disabled="topicState === 'active'"
        @click="clickTopicActivate"
      >
        <zap-icon size="18"></zap-icon>
      </button>
      <button class="download-button" @click="clickDownload">
        <download-icon size="18"></download-icon>
      </button>
    </div>
  </div>
</template>
<script lang="ts">
import Vue from "vue"
import type { PropOptions } from "vue"
import { DownloadIcon, ZapIcon } from "vue-feather-icons"
import { TopicState } from "@/models/contents"
import { UserItemStore } from "~/store"

export default Vue.extend({
  name: "TopicHeader",
  components: {
    DownloadIcon,
    ZapIcon,
  },
  props: {
    title: {
      type: String,
      required: true,
    },
    topicState: {
      type: String,
      required: true,
    } as PropOptions<TopicState>,
  },
  computed: {
    isAdmin(): boolean {
      return UserItemStore.userItems.isAdmin
    },
  },
  methods: {
    clickTopicActivate() {
      this.$emit("topic-activate")
    },
    clickDownload() {
      this.$emit("download")
    },
  },
})
</script>
