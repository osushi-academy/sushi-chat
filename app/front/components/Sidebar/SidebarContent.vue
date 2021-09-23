<template>
  <nav :class="['sidebar', navClass]">
    <div class="top-section">
      <button class="menu-button" @click="clickHumberger">
        <menu-icon size="1x"></menu-icon>
      </button>
      <div class="title">{{ title }}</div>
    </div>
    <div class="event-logo">
      <img
        v-if="imageUrl != null"
        :src="imageUrl"
        alt=""
        width="72px"
        height="72px"
      />
      <img
        v-else
        src="~/assets/img/tea.png"
        alt=""
        width="72px"
        height="72px"
      />
    </div>
    <div class="event-description">
      <p>
        {{ description }}
      </p>
    </div>
    <div class="channel-section">
      <ul>
        <li class="channel">
          <button
            class="channel-content"
            :class="{ selected: selectedTopicId === 0 }"
            @click="selectedTopicId = 0"
          >
            <span class="hashtag">#</span>雑談ラウンジ
          </button>
        </li>
        <li class="channel">
          <button
            class="channel-content has-subchannel"
            @click="openSessions = !openSessions"
          >
            <div class="channel-handle" :class="{ open: openSessions }">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                height="36px"
                viewBox="0 0 24 24"
                width="36px"
                fill="#000000"
              >
                <path d="M0 0h24v24H0V0z" fill="none" />
                <path
                  d="M8.71 11.71l2.59 2.59c.39.39 1.02.39 1.41 0l2.59-2.59c.63-.63.18-1.71-.71-1.71H9.41c-.89 0-1.33 1.08-.7 1.71z"
                />
              </svg>
            </div>
            <span class="hashtag">#</span>セッション
          </button>
          <transition
            @before-enter="beforeEnter"
            @enter="enter"
            @before-leave="beforeLeave"
            @leave="leave"
          >
            <ul v-if="openSessions" class="subchannel-list">
              <li
                v-for="(topic, index) in topics"
                :key="topic.id"
                class="subchannel-wrapper"
              >
                <button
                  class="subchannel"
                  :class="{ selected: selectedTopicId === topic.id }"
                  @click="selectedTopicId = topic.id"
                >
                  <span
                    :class="{ 'subchannel-arrow': true, first: index === 0 }"
                    aria-hidden="true"
                  ></span>
                  <span class="hashtag"
                    >#<span class="subchannel-index">{{
                      index + 1
                    }}</span></span
                  >{{ topic.title }}
                </button>
              </li>
            </ul>
          </transition>
          <ul
            class="subchannel-list shorthand-view"
            :style="{
              transition:
                !openSessions && selectedTopicId !== 0 ? 'all .1s .3s' : 'none',
              opacity: !openSessions && selectedTopicId !== 0 ? 1 : 0,
              visibility:
                !openSessions && selectedTopicId !== 0 ? 'visible' : 'hidden',
            }"
          >
            <li class="subchannel-wrapper">
              <button class="subchannel selected">
                <span class="subchannel-arrow first" aria-hidden="true"></span>
                <span class="hashtag"
                  >#<span class="subchannel-index">{{
                    (topics.findIndex(({ id }) => id === selectedTopicId) ||
                      0) + 1
                  }}</span></span
                >{{
                  //@ts-ignore
                  selectedTopic != null && selectedTopic.title
                }}
              </button>
            </li>
          </ul>
        </li>
      </ul>
    </div>
    <div class="footer-section">
      <div class="footer-link">
        <a href="#">使い方</a>
      </div>
      <div class="footer-link">
        <a
          href="https://forms.gle/mSSiZNMgEkp174oo9"
          target="_blank"
          rel="noopener noreferrer"
        >
          お問い合わせ
        </a>
      </div>
      <div class="footer-link">
        <a
          href="https://twitter.com/osushi_academy"
          target="_blank"
          rel="noopener noreferrer"
        >
          Twitter
        </a>
      </div>
    </div>
  </nav>
</template>
<script lang="ts">
import Vue from "vue"
import type { PropOptions } from "vue"
import { MenuIcon } from "vue-feather-icons"

type DataType = {
  openSessions: boolean
  selectedTopicId: number
}

export default Vue.extend({
  name: "SidebarContent",
  components: {
    MenuIcon,
  },
  props: {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    topics: {
      type: Array,
      required: true,
    } as PropOptions<{ id: number; title: string }[]>, // NOTE: ここの受け渡しの形は暫定
    showHumberger: {
      type: Boolean,
      default: false,
    },
    clickHumberger: {
      type: Function,
      required: false,
      default: undefined,
    } as PropOptions<() => void | undefined>,
    imageUrl: {
      type: String,
      default: undefined,
    },
    navClass: {
      type: String,
      default: "",
    },
  },
  data(): DataType {
    return {
      openSessions: true,
      selectedTopicId: 0, // TODO: Vuexに移す
    }
  },
  computed: {
    selectedTopic() {
      const selectedTopicId = (this as any).selectedTopicId as number
      return this.topics.find(({ id }) => id === selectedTopicId)
    },
  },
  methods: {
    beforeEnter(el: HTMLElement) {
      el.style.height = "0"
    },
    enter(el: HTMLElement) {
      el.style.height = el.scrollHeight + "px"
    },
    beforeLeave(el: HTMLElement) {
      el.style.height = el.scrollHeight + "px"
    },
    leave(el: HTMLElement) {
      el.style.height = "0"
    },
  },
})
</script>
