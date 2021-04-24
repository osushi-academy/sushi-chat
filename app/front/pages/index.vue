<template>
  <div class="container page">
    <modal v-if="isAdmin" name="topic-modal">
      <div class="modal-header">
        <h2>トピック作成</h2>
      </div>
      <div class="modal-body">
        <div v-for="(topic, index) in topics" :key="index">
          <input
            v-model="topic.content"
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
    <modal v-if="!isAdmin" name="sushi-modal" :click-to-close="false">
      <div class="modal-header">
        <h2>寿司を選んでね</h2>
      </div>
      <div class="modal-body">
        <div class="icon-list">
          <div v-for="(icon, index) in icons" :key="index" class="icon-box">
            <img
              :src="icon.url"
              alt=""
              :class="{ 'icon-selected': iconChecked == index }"
              @click="clickIcon(index)"
            />
          </div>
        </div>
        <button v-if="iconChecked >= 0" type="button" @click="hide">
          はじめる
        </button>
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
  isAdmin: boolean
  icons: any
  iconChecked: Number
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
      isAdmin: false,
      icons: [
        { url: require('@/assets/img/sushi_akami.png') },
        { url: require('@/assets/img/sushi_ebi.png') },
        { url: require('@/assets/img/sushi_harasu.png') },
        { url: require('@/assets/img/sushi_ikura.png') },
        { url: require('@/assets/img/sushi_iwashi.png') },
        { url: require('@/assets/img/sushi_kai_hokkigai.png') },
        { url: require('@/assets/img/sushi_salmon.png') },
        { url: require('@/assets/img/sushi_shirasu.png') },
        { url: require('@/assets/img/sushi_syari.png') },
        { url: require('@/assets/img/sushi_tai.png') },
        { url: require('@/assets/img/sushi_uni.png') },
      ],
      iconChecked: -1,
    }
  },
  mounted(): any {
    if (this.isAdmin) {
      this.$modal.show('topic-modal')
    } else {
      this.$modal.show('sushi-modal')
    }
  },
  methods: {
    getId(): string {
      return uuidv4()
    },
    // modalを消し、topic作成
    hide(): any {
      this.topics.push()
      if (this.isAdmin) {
        this.$modal.hide('topic-modal')
      } else {
        this.$modal.hide('sushi-modal')
      }
    },
    // 該当するtopicを削除
    removeTopic(index: number) {
      this.topics.splice(index, 1)
    },
    // topic追加
    addTopic() {
      // 新規topic
      const t: Model.Topic = {
        id: `${this.getId()}`,
        title: '',
        description: '',
      }
      this.topics.push(t)
    },
    // アイコン選択
    clickIcon(index: number) {
      this.iconChecked = index
    },
  },
})
</script>
