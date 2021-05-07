<template>
  <div
    class="topic-header"
    :class="{
      'finished-topic': isFinishedTopic,
      'active-topic': isActiveTopic,
    }"
  >
    <div class="main-line">
      <h1 class="title">{{ title }}</h1>
      <button class="download-button" @click="clickDownload">
        <download-icon class="" size="18"></download-icon>
      </button>
    </div>
  </div>
</template>
<script lang="ts">
import Vue from 'vue'
import { DownloadIcon } from 'vue-feather-icons'

export default Vue.extend({
  name: 'TopicHeader',
  components: {
    DownloadIcon,
  },
  props: {
    title: {
      type: String,
      required: true,
    },
    isActiveTopic: {
      type: Boolean,
      required: true,
    },
    isFinishedTopic: {
      type: Boolean,
      required: true,
    },
  },
  methods: {
    clickTopicActivate() {
      this.$emit('topic-activate')
    },
    clickDownload() {
      this.$emit('download')
    },
  },
})
</script>
