<template>
  <nav class="sidebar">
    <div class="top-section">
      <button class="menu-button">
        <menu-icon size="1x"></menu-icon>
      </button>
      <div class="title">技育CAMPハッカソン vol.5</div>
    </div>
    <div class="event-logo">
      <img src="~/assets/img/tea.png" alt="" width="72px" height="72px" />
    </div>
    <div class="event-description">
      <p>
        2日間(事前開発OK)で成果物を創ってエンジニアとしてレベルアップするオンラインハッカソン。テーマは「無駄開発」。
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
                  >{{ topic.label }}
                </button>
              </li>
            </ul>
          </transition>
        </li>
      </ul>
    </div>
    <div class="footer-section">
      <div class="footer-link">
        <a href="#">使い方</a>
      </div>
      <div class="footer-link">
        <a href="#">フィードバック</a>
      </div>
      <div class="footer-link">
        <a
          href="https://twitter.com/osushi_academy"
          target="_blank"
          rel="norefferrer"
          >@osushi_academy</a
        >
      </div>
    </div>
  </nav>
</template>
<script lang="ts">
import Vue, { PropOptions } from "vue"
import { MenuIcon } from "vue-feather-icons"

type DataType = {
  openSessions: boolean
  selectedTopicId: number
}

export default Vue.extend({
  name: "Sidebar",
  components: {
    MenuIcon,
  },
  props: {
    topics: {
      type: Object,
      required: true,
    } as PropOptions<{ id: number; label: string }[]>, // NOTE: ここの受け渡しの形は暫定
  },
  data(): DataType {
    return {
      openSessions: true,
      selectedTopicId: 0, // TODO: Vuexに移す
    }
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
