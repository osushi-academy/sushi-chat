<template>
  <div>
    <span v-for="(content, i) in text.split(/(https?:\/\/[^\s]*)/)" :key="i">
      <span v-if="i % 2 === 0">
        <span v-for="(token, j) in content.split(/(\n)/)" :key="j">
          <span v-if="j % 2 == 0">
            {{ token }}
          </span>
          <br v-else />
        </span>
      </span>
      <a
        v-else
        :href="content"
        target="_blank"
        rel="noopener noreferrer"
        class="url-to-link__link"
        :title="content"
        @click.stop
      >
        {{ content }}
      </a>
    </span>
  </div>
</template>
<script lang="ts">
import Vue from "vue"

export default Vue.extend({
  name: "UrlToLink",
  props: {
    text: {
      type: String,
      required: true,
    },
  },
})
</script>
