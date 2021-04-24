<template>
  <div class="container page">
    <modal name="hello-world">
      <div class="modal-header">
        <h2>トピック作成</h2>
      </div>
      <div class="modal-body">
        <div v-for="(topic, index) in topics" :key="index">
          <input
            v-model="topics[index]"
            class="textarea"
            contenteditable
            placeholder="トピック名"
            @keydown.enter.exact="addTopic"
          />
          <button type="button" @click="removeTopic(index)">削除</button>
        </div>
        <button type="button" @click="addTopic">追加</button>
        <button type="button" @click="hide">はじめる</button>
      </div>
    </modal>
    <div v-for="topic in topics" :key="topic.id">
      <ChatRoom :topic="topic" />
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
// @ts-ignore
import { v4 as uuidv4 } from 'uuid'
import VModal from 'vue-js-modal'
import * as Model from '@/models/contents'
import ChatRoom from '@/components/ChatRoom.vue'

// Data型
type DataType = {
  topics: Model.Topic[]
  isNotify: boolean
}
Vue.use(VModal)
export default Vue.extend({
  name: 'Index',
  components: {
    ChatRoom,
  },
  data(): DataType {
    return {
      topics: [
        {
          id: '0',
          title: '量子力学セミナー',
          description: '量子力学の発表',
        },
        {
          id: '1',
          title: 'めだまやき',
          description: 'めだまやきを焼く',
        },
      ],
      isNotify: false,
    }
  },
  mounted(): any {
    this.$modal.show('select-modal')
  },
  methods: {
    // modalを消し、topic作成
    hide(): any {
      this.topics.push()
      this.$modal.hide('select-modal')
    },
    // 該当するtopicを削除
    removeTopic(index: Number) {
      this.topics.splice(index, 1)
    },
    // topic追加
    addTopic() {
      this.topics.push() // 配列に１つ空データを追加する
    },
  },
})
</script>
