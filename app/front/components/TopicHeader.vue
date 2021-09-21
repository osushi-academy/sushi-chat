<template>
  <div class="topic-header">
    <div class="main-line">
      <div class="index">
        #<span style="font-size: 80%">{{ topicIndex }}</span>
      </div>
      <div class="title">{{ title }}</div>
      <button
        v-show="isAdmin"
        class="download-button zap"
        :disabled="topicState === 'active'"
        @click="clickTopicActivate"
      >
        <zap-icon size="18"></zap-icon>
      </button>
      <button class="link-button">
        <span class="material-icons"> link </span>
      </button>
      <button class="more-button">
        <span class="material-icons"> more_vert </span>
      </button>
      <!--button class="download-button" @click="clickDownload">
        <download-icon size="18"></download-icon>
      </button-->
    </div>
  </div>
</template>
<script lang="ts">
import Vue from "vue"
import type { PropOptions } from "vue"
import { ZapIcon } from "vue-feather-icons"
import { TopicState } from "@/models/contents"
import { UserItemStore } from "~/store"

export default Vue.extend({
  name: "TopicHeader",
  components: {
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
    topicIndex: {
      type: Number,
      required: true,
    },
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
