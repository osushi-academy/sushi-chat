<template>
  <div class="home__header">
    <slot />
  </div>
</template>

<script lang="ts">
import Vue from "vue"
export default Vue.extend({
  name: "HomeHeader",
})
</script>
