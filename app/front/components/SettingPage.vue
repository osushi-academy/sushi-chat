<template>
  <div class="drawer-menu-wrapper">
    <div class="drawer-menu">
      <div class="header">
        <p class="room-title">技育CAMPハッカソンvol.114514</p>
        <div class="room-url">
          <input v-model="test" readonly />
          <button class="material-icons" @click="writeToClipboard">
            content_copy
          </button>
        </div>
      </div>
      <button>
        <span class="material-icons"> fast_forward </span>次のトピックに遷移
      </button>
      <div class="my-icon icon-wrapper">
        <img src="@/assets/img/sushi_akami.png" alt="" />
      </div>

      <div class="topic-list">
        <ol>
          <li>チームA</li>
          <li>チームB</li>
          <li>チームC</li>
          <li>チームA</li>
          <li>チームB</li>
          <li>チームC</li>
          <li>チームA</li>
          <li>チームB</li>
          <li>チームC</li>
          <li>チームA</li>
          <li>チームB</li>
          <li>チームC</li>
          <li>チームA</li>
          <li>チームB</li>
          <li>チームC</li>
          <li>チームA</li>
          <li>チームB</li>
          <li>チームC</li>
          <li>チームA</li>
          <li>チームB</li>
          <li>チームC</li>
          <li>チームA</li>
          <li>チームB</li>
          <li>チームC</li>
          <li>チームA</li>
          <li>チームB</li>
          <li>チームC</li>
          <li>チームA</li>
          <li>チームB</li>
          <li>チームC</li>
          <li>チームA</li>
          <li>チームB</li>
          <li>チームC</li>
        </ol>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'

type DataType = {
  test: string
}

export default Vue.extend({
  name: 'SettingPage',
  props: {},
  data(): DataType {
    return {
      test: 'https://sushi-chat.com',
    }
  },
  methods: {
    writeToClipboard() {
      navigator.clipboard.writeText(this.test).catch((e) => {
        console.error(e)
      })
    },
  },
})
</script>
