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
            <span>https://sushi-chat-cyan.vercel.app/{{ room.roomKey }}</span>
            <button
              class="material-icons copy-button"
              @click="writeToClipboard"
            >
              content_copy
            </button>
          </div>
        </div>
      </div>

      <button v-if="MyIconId === '0'" class="next-topic-button">
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
          <div class="topic-number">{{ index + 1 }}</div>
          <div class="topic-name">
            {{ topic.title
            }}<span v-if="topicStates[topic.id] === 'ongoing'" class="label"
              >進行中</span
            >
            <span v-if="topicStates[topic.id] === 'paused'" class="label"
              >一時停止</span
            >
          </div>
          <div v-if="MyIconId === '0'" class="buttons">
            <button>
              <span
                v-if="topicStates[topic.id] != 'finished'"
                class="material-icons"
                >{{ playOrPause(topicStates[topic.id]) }}</span
              >
            </button>
            <button>
              <span
                v-if="
                  topicStates[topic.id] === 'ongoing' ||
                  topicStates[topic.id] === 'paused'
                "
                class="material-icons"
                >stop</span
              >
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'

// TODO:モデル更新後にここは消してcontent.ts読み込むようにする
type TopicState = 'not-started' | 'ongoing' | 'paused' | 'finished'
type TopicLinkType = 'github' | 'slide' | 'product'
type Topic = {
  id: string
  title: string
  description: string
  urls: Record<TopicLinkType, string>
}
type Room = {
  id: string
  roomKey: string
  title: string
  topics: Topic[]
}

type DataType = {
  room: Room
  topicStates: { [key: string]: TopicState }
  MyIconId: string
}

export default Vue.extend({
  name: 'SettingPage',
  props: {},
  data(): DataType {
    return {
      room: {
        id: 'testID',
        roomKey: 'testRoomKey',
        title: '技育CAMPハッカソンvol.3',
        topics: DUMMY_TOPICS,
      },
      topicStates: DUMMY_TOPIC_STATES,
      MyIconId: '0',
    }
  },
  computed: {
    icon(): { icon: string } {
      return ICONS[this.MyIconId]?.icon ?? ICONS[0].icon
    },
    playOrPause(): {} {
      return function (type: string) {
        if (type === 'ongoing' || type === 'not-started') {
          return 'play_arrow'
        } else if (type === 'paused') {
          return 'pause'
        } else {
          return null
        }
      }
    },
  },
  methods: {
    writeToClipboard() {
      navigator.clipboard.writeText(this.test)
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
  c: 'ongoing',
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
