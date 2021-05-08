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
        class="next-button"
        role="navigation"
        @click="clickTopicActivate"
      >
        <span class="material-icons"> arrow_forward </span>
      </button>
    </div>
  </div>
</template>
<script lang="ts">
import Vue, { PropOptions } from 'vue'
import { TopicState } from '@/models/contents'

export default Vue.extend({
  name: 'TopicHeader',
  props: {
    title: {
      type: String,
      required: true,
    },
    isAdmin: {
      type: Boolean,
      required: true,
      default: false,
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
  },
})
</script>
