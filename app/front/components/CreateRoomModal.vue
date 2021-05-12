<template>
  <modal name="sushi-modal" :adaptive="true" :click-to-close="false">
    <div class="modal-header">
      <h2>ルーム作成</h2>
    </div>
    <div class="modal-body modal-scrollable">
      <h3>ルーム名</h3>
      <input v-model="room.title" />
      <h3>トピック名</h3>
      <div>
        <div v-for="(topic, index) in topicsAdmin" :key="index">
          <h3 class="modal-index">{{ index + 1 }}</h3>
          <input
            v-model="topicsAdmin[index].title"
            :tabindex="index"
            name="titleArea"
            class="secondary-textarea text-input"
            contenteditable
            placeholder="トピック名"
          />
          <button
            type="button"
            class="secondary-button topic-remove"
            @click="removeTopic(index)"
          >
            削除
          </button>
        </div>
        <textarea v-model="inputText"></textarea>
        <button
          type="button"
          class="secondary-button topic-add"
          @click="addTopic"
        >
          追加
        </button>
        <button
          type="button"
          class="secondary-button topic-start"
          @click="startChat"
        >
          はじめる
        </button>
      </div>
    </div>
  </modal>
</template>

<script lang="ts">
import Vue from 'vue'
import { Room, Topic } from '@/models/contents'

type DataType = {
  topicsAdmin: Omit<Topic, 'id'>[]
  room: Room
  inputText: String
}

export default Vue.extend({
  name: 'CreateRoomModal',
  data(): DataType {
    return {
      room: {} as Room,
      topicsAdmin: [],
      inputText: '',
    }
  },
  methods: {
    // 該当するtopicを削除
    removeTopic(index: number) {
      this.topicsAdmin.splice(index, 1)
    },
    // textareaに入力された文字を改行で区切ってtopic追加
    addTopic() {
      // 追加済みtopic名リスト作成
      const set = new Set<string>()
      for (const topic of this.topicsAdmin) {
        set.add(topic.title)
      }
      // 入力を空白で区切る
      const titles = this.inputText.split('\n')
      for (const topicTitle of titles) {
        // 空白はカウントしない
        if (topicTitle === '') continue
        // 重複してるトピックはカウントしない
        if (set.has(topicTitle)) continue

        const t: Omit<Topic, 'id'> = {
          title: topicTitle,
          // description: '',
          urls: { github: '', slide: '', product: '' },
        }
        this.topicsAdmin.push(t)
        set.add(topicTitle)
      }
      this.inputText = ''
    },
    // エンターキーでaddTopic呼び出し
    clickAddTopic(e: any) {
      // 日本語入力中のeventnterキー操作は無効にする
      if (e.keyCode !== 13) return
      this.addTopic()
    },
    startChat() {
      this.$emit('start-chat', this.room, this.topicsAdmin)
    },
  },
})
</script>
