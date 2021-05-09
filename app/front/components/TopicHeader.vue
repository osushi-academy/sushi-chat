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
import Vue, { PropOptions } from 'vue'
import { TopicState } from '@/models/contents'
import { DownloadIcon, ZapIcon } from 'vue-feather-icons'

export default Vue.extend({
  name: 'TopicHeader',
  components: {
    DownloadIcon,
    ZapIcon,
  },
  props: {
    title: {
      type: String,
      required: true,
    },
    isAdmin: {
      type: Boolean,
      required: true,
    },
    topicState: {
      type: String,
      required: true,
    } as PropOptions<TopicState>,
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
