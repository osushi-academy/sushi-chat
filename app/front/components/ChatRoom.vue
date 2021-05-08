<template>
  <article class="topic-block">
    <TopicHeader
      :title="topicIndex + 1 + '. ' + chatData.topic.title"
      :topic-state="topicState"
      :is-admin="isAdmin"
      @topic-activate="clickTopicActivate"
    />
    <div class="chat-area">
      <div class="text-zone">
        <transition-group
          :id="chatData.topic.id"
          class="scrollable list-complete"
          tag="div"
        >
          <div
            v-for="message in chatData.message"
            :key="message.id"
            class="list-complete-item"
          >
            <MessageComponent
              :message="message"
              @click-card="clickReaction"
              @click-reply="selectedChatItem = message"
            />
          </div>
        </transition-group>
      </div>
      <div class="stamp-zone">
        <FavoriteButton
          :favorite-callback-register="
            (callback) => favoriteCallbackRegister(chatData.topic.id, callback)
          "
          :disabled="topicState !== 'active'"
          @favorite="clickFavorite"
        />
      </div>
      <button v-show="isNotify" class="message-badge" @click="clickScroll">
        最新のコメント
        <div class="material-icons">arrow_downward</div>
      </button>
    </div>
    <TextArea
      :topic="chatData.topic"
      :my-icon="myIcon"
      :disabled="isNotStartedTopic"
      @submit="clickSubmit"
    />
  </article>
</template>
<script lang="ts">
import Vue, { PropOptions } from 'vue'
import { Topic, ChatItem, Message, TopicState } from '@/models/contents'
import TopicHeader from '@/components/TopicHeader.vue'
import MessageComponent from '@/components/Message.vue'
import TextArea from '@/components/TextArea.vue'
import FavoriteButton from '@/components/FavoriteButton.vue'

type ChatDataPropType = {
  topic: Topic
  message: ChatItem[]
}

type FavoriteCallbackRegisterPropType = {
  favoriteCallbackRegister: (
    topicId: string,
    callback: (count: number) => void
  ) => void
}

// Data型
type DataType = {
  isNotify: boolean
  selectedChatItem: ChatItem | null
}

export default Vue.extend({
  name: 'ChatRoom',
  components: {
    TopicHeader,
    MessageComponent,
    TextArea,
    FavoriteButton,
  },
  props: {
    chatData: {
      type: Object,
      required: true,
    } as PropOptions<ChatDataPropType>,
    topicIndex: {
      type: Number,
      required: true,
      default: 0,
    },
    isAdmin: {
      type: Boolean,
      required: true,
      default: false,
    },
    favoriteCallbackRegister: {
      type: Function,
      required: true,
    } as PropOptions<FavoriteCallbackRegisterPropType>,
    myIcon: {
      type: Number,
      required: true,
    },
    topicState: {
      type: String,
      required: true,
    } as PropOptions<TopicState>,
  },
  data(): DataType {
    return {
      isNotify: false,
      selectedChatItem: null,
    }
  },
  computed: {
    isNotStartedTopic() {
      return this.topicState === 'not-started'
    },
  },
  watch: {
    chatData() {
      Vue.nextTick(() => {
        this.scrollToBottomOrShowModal()
      })
    },
  },
  methods: {
    // 送信ボタン
    clickSubmit(text: string, isQuestion: boolean) {
      if (this.selectedChatItem == null) {
        if (isQuestion) {
          // 質問
          this.$emit('send-question', text, this.chatData.topic.id)
        } else {
          // 通常メッセージ
          this.$emit('send-message', text, this.chatData.topic.id, null)
        }
      } else if (
        this.selectedChatItem.type === 'message' ||
        this.selectedChatItem.type === 'answer'
      ) {
        // リプライ
        this.$emit(
          'send-message',
          text,
          this.chatData.topic.id,
          this.selectedChatItem
        )
      } else if (this.selectedChatItem.type === 'question') {
        // 回答
        this.$emit('send-answer', text, this.selectedChatItem)
      }
      this.clickScroll()
      this.selectedChatItem = null
    },
    clickReaction(message: Message) {
      this.$emit('send-reaction', message)
    },
    // ハートボタン
    clickFavorite() {
      this.$emit('send-stamp', this.chatData.topic.id)
    },
    scrollToBottomOrShowModal() {
      // 下までスクロールされていなければ通知を出す
      const element: HTMLElement | null = document.getElementById(
        this.chatData.topic.id
      )
      if (element == null) return
      if (this.isScrollBottom(element)) {
        element.scrollTo({
          top: element.scrollHeight,
          left: 0,
          behavior: 'smooth',
        })
      } else {
        this.isNotify = true
      }
    },
    // いちばん下までスクロール
    clickScroll() {
      const element: HTMLElement | null = document.getElementById(
        this.chatData.topic.id
      )
      if (element) {
        element.scrollTo({
          top: element.scrollHeight,
          left: 0,
          behavior: 'smooth',
        })
        this.isNotify = false
      }
    },
    // いちばん下までスクロールしてあるか
    isScrollBottom(element: HTMLElement): Boolean {
      return (
        element.scrollHeight < element.scrollTop + element.offsetHeight + 200
      )
    },
    clickTopicActivate() {
      this.$emit('topic-activate', this.chatData.topic.id)
    },
  },
})
</script>
