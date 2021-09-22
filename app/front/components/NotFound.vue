<template>
  <div class="sushi-select not-found">
    <picture class="not-found__icon">
      <source :srcset="icon.webp" type="image/webp" />
      <img :src="icon.png" alt="" />
    </picture>
    <div class="not-found__textbox">
      <div class="not-found__textbox--title">
        お探しのルームが見つかりません
      </div>
      <div>お探しのルームは、公開が停止されたか削除された可能性があります</div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from "vue"
import ICONS from "@/utils/icons"

export default Vue.extend({
  name: "NotFound",
  computed: {
    icon() {
      return ICONS[0]
    },
  },
})
</script>
