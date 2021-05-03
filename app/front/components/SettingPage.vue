<template>
  <div class="drawer-menu-wrapper">
    <div class="drawer-menu">
      <div class="header">
        <div class="icon-space">
          <img class="icon-wrapper" src="@/assets/img/sushi_akami.png" alt="" />
        </div>
        <div class="room-info">
          <div class="room-title">
            <p>ハッカソンvol.1</p>
          </div>
          <div class="room-url">
            <input v-model="test" readonly />
            <button class="material-icons" @click="writeToClipboard">
              content_copy
            </button>
          </div>
        </div>
      </div>

      <button class="next-topic-button">
        <span class="material-icons"> fast_forward </span>
        次のトピックに遷移
      </button>

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
