<template>
  <div class="home-top">
    <div>マイページ</div>
    <button class="home-top__add-new-event-button">
      <NuxtLink to="/room/create">
        <span class="material-icons"> add </span>新しいイベントを追加
      </NuxtLink>
    </button>
  </div>
</template>

<script lang="ts">
import Vue from "vue"

export default Vue.extend({
  name: "Home",
  layout: "home",
})
</script>
