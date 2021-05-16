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
            <span>{{ baseUrl }}?roomId={{ room.id }}</span>
            <button
              class="material-icons copy-button"
              :disabled="
                room.topics.findIndex((t) => topicStates[t.id] === 'active') ==
                null
              "
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
import { TopicStatesPropType, Room } from '@/models/contents'

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
    baseUrl() {
      return String(location.href).replace('?user=admin', '')
    },
    playOrPause() {
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
      navigator.clipboard.writeText(this.baseUrl + '?roomId=' + this.room.id)
    },
    clickPlayPauseButton(topicId: string) {
      if (this.topicStates[topicId] === 'active') {
        this.$emit('change-topic-state', topicId, 'paused')
      } else if (this.topicStates[topicId] === 'paused') {
        this.$emit('change-topic-state', topicId, 'active')
      } else if (this.topicStates[topicId] === 'not-started') {
        this.$emit('change-topic-state', topicId, 'active')
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
      // アクティブなトピックを探す
      const currentActiveTopicIndex = this.room.topics.findIndex(
        (t) => this.topicStates[t.id] === 'active'
      )

      if (currentActiveTopicIndex == null) {
        return
      }

      const nextTopic = this.room.topics?.[currentActiveTopicIndex + 1]

      if (nextTopic != null) {
        this.$emit('change-topic-state', nextTopic.id, 'active')
      }

      // let alertMessage = '以下の操作を実行しますか？\n'
      // let closeFlag = false
      // let openFlag = false
      // if (typeof closeTopic !== 'undefined') closeFlag = true
      // if (typeof topic !== 'undefined') openFlag = true

      // if (closeFlag) {
      //   alertMessage += 'トピックを閉じる：' + closeTopic.title
      //   if (openFlag) {
      //     alertMessage += '\n↓\n'
      //   }
      // }
      // if (openFlag) {
      //   alertMessage += 'トピックを開く：' + topic.title + '\n'
      // }
      // console.log(topic)
      // if (openFlag || closeFlag) {
      // if (confirm(alertMessage)) {
      //   this.$emit('change-topic-state', topic.id!, 'active')
      //   this.$emit('change-topic-state', closeTopic.id!, 'finished')
      // }
      // }
    },
  },
})

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
