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
            @change="CheckTopicLength(index, $event)"
            @keydown.enter.exact="clickAddTopic(index, $event)"
          />
          <button
            type="button"
            class="secondary-button topic-remove"
            @click="removeTopic(index)"
          >
            削除
          </button>
          <p v-if="isLongTopic[index]" style="color: red">
            トピック名は{{ MAX_TOPIC_LENGTH }}字以内にしてください
          </p>
        </div>
        <textarea v-model="inputText"></textarea>
        <p v-if="isLongInputTopic" style="color: red">
          トピック名は{{ MAX_TOPIC_LENGTH }}字以内にしてください
        </p>
        <button
          type="button"
          class="secondary-button topic-add"
          @click="addTopic"
        >
          追加
        </button>
        <button
          v-if="canStart"
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
  MAX_TOPIC_LENGTH: Number
  isLongInputTopic: boolean
  isLongTopic: boolean[]
  canStart: boolean
}

export default Vue.extend({
  name: 'CreateRoomModal',
  data(): DataType {
    return {
      room: {} as Room,
      topicsAdmin: [],
      inputText: '',
      MAX_TOPIC_LENGTH: 100,
      isLongInputTopic: false,
      isLongTopic: [],
      canStart: false,
    }
  },
  methods: {
    // 該当するtopicを削除
    removeTopic(index: number) {
      this.topicsAdmin.splice(index, 1)
      this.isLongTopic.slice(index, 1)
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
      // 1つでも最大文字数を超えているトピックがあれば却下する
      const topicsTmp = this.topicsAdmin.slice(0, this.topicsAdmin.length)
      const isLongTopicsTmp: boolean[] = []
      for (const topicTitle of titles) {
        // 空白はカウントしない
        if (topicTitle === '') continue
        // 重複してるトピックはカウントしない
        if (set.has(topicTitle)) continue
        if (topicTitle.length > this.MAX_TOPIC_LENGTH) {
          this.isLongInputTopic = true
          return
        }
        const t: Omit<Topic, 'id'> = {
          title: topicTitle,
          // description: '',
          urls: { github: '', slide: '', product: '' },
        }
        set.add(topicTitle)
        topicsTmp.push(t)
        isLongTopicsTmp.push(true)
      }
      if (this.topicsAdmin.length === 0) this.canStart = true
      this.topicsAdmin = topicsTmp
      this.inputText = ''
      this.isLongInputTopic = false
      this.isLongTopic.concat(isLongTopicsTmp)
    },
    // エンターキーでaddTopic呼び出し
    clickAddTopic(index: number, event: any) {
      // 日本語入力中のeventnterキー操作は無効にする
      if (event.keyCode !== 13) return
      const t: Omit<Topic, 'id'> = {
        title: '',
        // description: '',
        urls: { github: '', slide: '', product: '' },
      }
      this.topicsAdmin.splice(index + 1, 0, t)
      this.isLongTopic.splice(index + 1, 0, false)
    },
    startChat() {
      this.$emit('start-chat', this.room, this.topicsAdmin)
    },
    CheckTopicLength(index: number, event: any) {
      const topic = event.target.value
      if (topic.length > this.MAX_TOPIC_LENGTH) {
        this.$set(this.isLongTopic, index, true)
        this.canStart = false
      } else {
        this.$set(this.isLongTopic, index, false)
        const num = this.isLongTopic.filter((t) => t === false).length
        if (num === this.isLongTopic.length) {
          this.canStart = true
        } else {
          this.canStart = false
        }
      }
    },
  },
})
</script>
