<template>
  <div class="home__header">
    <NuxtLink to="/home"><slot /></NuxtLink>
  </div>
</template>

<script lang="ts">
import Vue from "vue"
export default Vue.extend({
  name: "HomeHeader",
})
</script>
