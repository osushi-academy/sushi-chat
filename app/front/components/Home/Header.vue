<template>
  <div class="home__header">
    <a href="/home"><slot /></a>
  </div>
</template>

<script lang="ts">
import Vue from "vue"
export default Vue.extend({
  name: "HomeHeader",
})
</script>
