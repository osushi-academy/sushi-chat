<template>
  <div class="drawer-menu-wrapper">
    <div class="drawer-menu">
      <div class="header">
        <div class="icon-space">
          <img class="icon-wrapper" :src="icon" alt="" />
        </div>
        <div class="room-info">
          <div class="room-title">
            <p>{{ room.title }}</p>
          </div>
          <div class="room-url">
            <span
              >https://sushi-chat-cyan.vercel.app/?roomId={{ room.id }}</span
            >
            <button
              class="material-icons copy-button"
              @click="writeToClipboard"
            >
              content_copy
            </button>
          </div>
        </div>
      </div>

      <button
        v-if="myIconId === 0"
        class="next-topic-button"
        @click="clickNextTopicButton"
      >
        <span class="material-icons"> fast_forward </span>
        次のトピックに遷移
      </button>

      <div class="topic-list">
        <div
          v-for="(topic, index) in room.topics"
          :key="topic.id"
          class="topic"
          :class="topicStates[topic.id]"
        >
          <div class="topic-number">{{ index }}</div>
          <div class="topic-name">
            {{ topic.title
            }}<span v-if="topicStates[topic.id] === 'active'" class="label"
              >進行中</span
            >
            <span v-if="topicStates[topic.id] === 'paused'" class="label"
              >一時停止</span
            >
          </div>
          <div v-if="myIconId === 0" class="buttons">
            <button
              v-if="topicStates[topic.id] != 'finished'"
              @click="clickPlayPauseButton(topic.id)"
            >
              <span class="material-icons">{{
                playOrPause(topicStates[topic.id])
              }}</span>
            </button>
            <button
              v-if="
                topicStates[topic.id] === 'active' ||
                topicStates[topic.id] === 'paused'
              "
              @click="clickFinishButton(topic.id)"
            >
              <span class="material-icons">stop</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue, { PropOptions } from 'vue'
import { TopicStatesPropType, Room, TopicState } from '@/models/contents'

export default Vue.extend({
  name: 'SettingPage',
  props: {
    room: {
      type: Object,
      required: true,
    } as PropOptions<Room>,
    topicStates: {
      type: Object,
      required: true,
    } as PropOptions<TopicStatesPropType>,
    myIconId: {
      type: Number,
      required: true,
    },
  },
  computed: {
    icon(): { icon: string } {
      return ICONS[this.myIconId]?.icon ?? ICONS[0].icon
    },
    playOrPause(): {} {
      return function (topicState: string) {
        if (topicState === 'active') {
          return 'pause'
        } else if (topicState === 'paused' || topicState === 'not-started') {
          return 'play_arrow'
        } else {
          return null
        }
      }
    },
  },
  methods: {
    writeToClipboard() {
      navigator.clipboard.writeText(
        'https://sushi-chat-cyan.vercel.app/?roomId=' + this.room.id
      )
    },
    clickPlayPauseButton(topicId: string) {
      if (this.topicStates[topicId] === 'active') {
        this.topicStates[topicId] = 'paused'
      } else if (this.topicStates[topicId] === 'paused') {
        this.topicStates[topicId] = 'active'
      } else if (this.topicStates[topicId] === 'not-started') {
        this.topicStates[topicId] = 'active'
      }
    },
    clickFinishButton(topicId: string) {
      if (
        confirm('本当にこのトピックを終了しますか？この操作は取り消せません')
      ) {
        this.topicStates[topicId]! = 'finished'
      }
    },
    clickNextTopicButton() {
      // クローズにするトピックを探す
      const closeTopic = this.room.topics.find(
        (t) => this.topicStates[t.id] === 'active'
      )
      // アクティブにするトピックを探す
      const topic = this.room.topics.find(
        (t) => this.topicStates[t.id] === 'not-started'
      )

      let alertMessage = '以下の操作を実行しますか？\n'
      if (typeof closeTopic !== 'undefined' && typeof topic !== 'undefined') {
        alertMessage += 'トピックを閉じる：' + closeTopic.title + '\n↓\n'
        alertMessage += 'トピックを開く：' + topic.title + '\n'
        if (confirm(alertMessage)) {
          this.topicStates[closeTopic.id] = 'finished'
          this.topicStates[topic.id] = 'active'
        }
      } else if (typeof closeTopic !== 'undefined') {
        alertMessage += 'トピックを閉じる：' + closeTopic.title + '\n'
        if (confirm(alertMessage)) {
          this.topicStates[closeTopic.id] = 'finished'
        }
      } else if (typeof topic !== 'undefined') {
        alertMessage += 'トピックを開く：' + topic.title + '\n'
        if (confirm(alertMessage)) {
          this.topicStates[topic.id] = 'active'
        }
      }
    },
  },
})

const DUMMY_TOPICS = [
  {
    id: 'a',
    title: 'チームA',
    description: 'aaaaaa',
    urls: { github: '', slide: '', product: '' },
  },
  {
    id: 'b',
    title: 'チームB',
    description: 'aaaaa',
    urls: { github: '', slide: '', product: '' },
  },
  {
    id: 'c',
    title: 'チームCCCCCCCCCCCCCCCCC',
    description: 'aaaaa',
    urls: { github: '', slide: '', product: '' },
  },
  {
    id: 'd',
    title: 'チームDDDDDDDDDDDDDDDDDDDD',
    description: 'aaaaa',
    urls: { github: '', slide: '', product: '' },
  },
  {
    id: 'e',
    title: 'チームE',
    description: 'aaaaa',
    urls: { github: '', slide: '', product: '' },
  },
  {
    id: 'f',
    title: 'チームF',
    description: 'aaaaa',
    urls: { github: '', slide: '', product: '' },
  },
  {
    id: 'g',
    title: 'チームG',
    description: 'aaaaa',
    urls: { github: '', slide: '', product: '' },
  },
  {
    id: 'h',
    title: 'チームH',
    description: 'aaaaa',
    urls: { github: '', slide: '', product: '' },
  },
  {
    id: 'i',
    title: 'チームI',
    description: 'aaaaa',
    urls: { github: '', slide: '', product: '' },
  },
]
const DUMMY_TOPIC_STATES: { [key: string]: TopicState } = {
  a: 'finished',
  b: 'finished',
  c: 'active',
  d: 'paused',
  e: 'not-started',
  f: 'not-started',
  g: 'not-started',
  h: 'not-started',
  i: 'not-started',
}
const ICONS = [
  { icon: require('@/assets/img/tea.png') },
  { icon: require('@/assets/img/sushi_akami.png') },
  { icon: require('@/assets/img/sushi_ebi.png') },
  { icon: require('@/assets/img/sushi_harasu.png') },
  { icon: require('@/assets/img/sushi_ikura.png') },
  { icon: require('@/assets/img/sushi_iwashi.png') },
  { icon: require('@/assets/img/sushi_kai_hokkigai.png') },
  { icon: require('@/assets/img/sushi_salmon.png') },
  { icon: require('@/assets/img/sushi_shirasu.png') },
  { icon: require('@/assets/img/sushi_tai.png') },
  { icon: require('@/assets/img/sushi_uni.png') },
  { icon: require('@/assets/img/sushi_syari.png') },
]
</script>
