<template>
  <div class="drawer-menu-wrapper">
    <div class="drawer-menu">
      <div class="drawer-menu__header">
        <div class="room-info">
          <div class="room-title">
            <p>管理者ツール - {{ room.title }}</p>
          </div>
          <div class="room-url">
            <button :title="roomUrl" @click="writeToClipboard(roomUrl, 0)">
              <div id="url-copy-label" class="room-text">
                <span class="bold">参加者</span>用<br />招待URLのコピー
              </div>
              <CheckIcon
                v-if="copyCompleted"
                class="copy-button check-icon"
              ></CheckIcon>
              <CopyIcon
                v-else
                aria-labelledby="url-copy-label"
                class="copy-button"
              ></CopyIcon>
            </button>
            <button
              id="admin-url-copy-label"
              :title="inviteUrl"
              @click="writeToClipboard(inviteUrl, 1)"
            >
              <div class="room-text">
                <span class="bold">管理者</span>用<br />招待URLのコピー
              </div>
              <CheckIcon
                v-if="copyAdminCompleted"
                class="copy-button check-icon"
              ></CheckIcon>
              <CopyIcon
                v-else
                class="copy-button"
                aria-labelledby="admin-url-copy-label"
              ></CopyIcon>
            </button>
          </div>
        </div>
        <button v-if="isNotRoomStarted" class="start-button" @click="startRoom">
          <PlayCircleIcon
            aria-hidden="true"
            class="start-button__label"
          ></PlayCircleIcon>
          <span>ルームを開始する</span>
        </button>
      </div>

      <div class="drawer-menu__topic-list">
        <div
          v-for="topic in topics"
          :key="topic.id"
          class="topic"
          :class="
            topicStateItems[topic.id]
              ? topicStateItems[topic.id]
              : 'not-started'
          "
        >
          <div class="topic-number">#{{ topic.id }}</div>
          <div class="topic-name">
            {{ topic.title }}
            <span v-if="topicStateItems[topic.id] === 'ongoing'" class="label">
              進行中
            </span>
            <span v-if="topicStateItems[topic.id] === 'paused'" class="label">
              一時停止
            </span>
          </div>
          <div v-if="isRoomOngoing" class="buttons">
            <!-- not-started / paused -->
            <button
              v-if="
                topicStateItems[topic.id] === 'not-started' ||
                topicStateItems[topic.id] === 'paused'
              "
              v-tippy
              aria-label="トピックを開始する"
              content="トピックを開始する"
              @click="clickPlayPauseButton(topic.id)"
            >
              <PlayCircleIcon aria-hidden="true"></PlayCircleIcon>
            </button>
            <!-- ongoing -->
            <template v-else-if="topicStateItems[topic.id] === 'ongoing'">
              <button
                v-tippy
                class="pause"
                content="トピックを一時停止する"
                aria-label="トピックを一時停止する"
                @click="clickPlayPauseButton(topic.id)"
              >
                <PauseCircleIcon aria-hidden="true"></PauseCircleIcon>
              </button>
              <button
                v-tippy
                class="danger"
                aria-label="トピックを終了する"
                content="トピックを終了する"
                @click="clickFinishButton(topic.id)"
              >
                <StopCircleIcon aria-hidden="true"></StopCircleIcon>
              </button>
            </template>
            <!-- finished -->
            <button
              v-else-if="topicStateItems[topic.id] === 'finished'"
              v-tippy
              aria-label="トピックを再度開始する"
              content="トピックを再度開始する"
              class="reopen"
              @click="clickRestartButton(topic.id)"
            >
              <RotateCcwIcon aria-hidden="true"></RotateCcwIcon>
            </button>
            <div v-if="isRoomOngoing || isRoomFinished" class="topic-infos">
              <div class="topic-info">
                {{ postCounts[topic.id].commentCount
                }}<span class="text-mini">comments</span>
              </div>
              <div class="topic-info">
                {{ postCounts[topic.id].stampCount
                }}<span class="text-mini">stamps</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="drawer-menu__footer">
        <button v-if="isRoomOngoing" class="end-button" @click="finishRoom">
          <span class="end-button__label">ルームを終了する</span>
          <AlertCircleIcon
            size="1.5x"
            class="end-button__icon"
            aria-hidden="true"
          ></AlertCircleIcon>
        </button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from "vue"
import { RoomModel, Topic } from "sushi-chat-shared"
import {
  PlayCircleIcon,
  PauseCircleIcon,
  StopCircleIcon,
  RotateCcwIcon,
  CopyIcon,
  CheckIcon,
  AlertCircleIcon,
} from "vue-feather-icons"
// @ts-ignore
import VueTippy, { TippyComponent } from "vue-tippy"
import ICONS from "@/utils/icons"
import {
  UserItemStore,
  TopicStore,
  TopicStateItemStore,
  ChatItemStore,
  StampStore,
  RoomStore,
} from "~/store"

type DataType = {
  copyCompleted: boolean
  copyAdminCompleted: boolean
}

Vue.use(VueTippy, {
  flipDuration: 0,
  animateFill: false,
  delay: [500, 0],
})
Vue.component("Tippy", TippyComponent)

export default Vue.extend({
  name: "AdminTool",
  components: {
    PlayCircleIcon,
    PauseCircleIcon,
    StopCircleIcon,
    RotateCcwIcon,
    CopyIcon,
    CheckIcon,
    AlertCircleIcon,
  },
  data(): DataType {
    return {
      copyCompleted: false,
      copyAdminCompleted: false,
    }
  },
  computed: {
    room(): RoomModel {
      return RoomStore.room
    },
    isNotRoomStarted(): boolean {
      return this.room.state === "not-started"
    },
    isRoomOngoing(): boolean {
      return this.room.state === "ongoing"
    },
    isRoomFinished(): boolean {
      return this.room.state === "finished"
    },
    topics(): Topic[] {
      return TopicStore.topics
    },
    topicStateItems() {
      return TopicStateItemStore.topicStateItems
    },
    icon() {
      return ICONS[UserItemStore.userItems.myIconId] ?? ICONS[0]
    },
    inviteUrl(): string {
      if (this.room.adminInviteKey) {
        return `${location.origin}/invited/?roomId=${encodeURIComponent(
          this.room.id,
        )}&admin_invite_key=${encodeURIComponent(this.room.adminInviteKey)}`
      }
      return ""
    },
    roomUrl(): string {
      return `${location.origin}/room/${encodeURIComponent(this.room.id)}`
    },
    // 各トピックごとのコメント数、スタンプ数を集計する
    postCounts(): Record<number, { commentCount: number; stampCount: number }> {
      return Object.fromEntries(
        TopicStore.topics.map(({ id }) => [
          id,
          {
            commentCount: ChatItemStore.chatItems.filter(
              ({ topicId, senderType }) =>
                topicId === id && senderType !== "system",
            ).length,
            stampCount: StampStore.stamps.filter(
              ({ topicId }) => topicId === id,
            ).length,
          },
        ]),
      )
    },
  },
  methods: {
    // ルーム開始
    startRoom() {
      this.$emit("start-room")
    },
    // ルーム終了
    finishRoom() {
      if (confirm("本当にこのルームを終了しますか？この操作は取り消せません")) {
        this.$emit("finish-room")
      }
    },
    writeToClipboard(s: string, idx: number) {
      navigator.clipboard.writeText(s)
      if (idx === 0) {
        this.copyCompleted = true
        setTimeout(() => {
          this.copyCompleted = false
        }, 2000)
      } else {
        this.copyAdminCompleted = true
        setTimeout(() => {
          this.copyAdminCompleted = false
        }, 2000)
      }
    },
    clickPlayPauseButton(topicId: number) {
      if (this.topicStateItems[topicId] === "ongoing") {
        // ongoingならばpausedに
        this.$emit("change-topic-state", topicId, "paused")
      } else if (
        this.topicStateItems[topicId] === "paused" ||
        this.topicStateItems[topicId] === "not-started"
      ) {
        // paused, not-startedならばongoingに
        this.$emit("change-topic-state", topicId, "ongoing")
      }
    },
    clickFinishButton(topicId: number) {
      TopicStateItemStore.change({ key: topicId, state: "finished" })
      this.$emit("change-topic-state", topicId, "finished")
    },
    clickRestartButton(topicId: number) {
      TopicStateItemStore.change({ key: topicId, state: "finished" })
      this.$emit("change-topic-state", topicId, "ongoing")
    },
  },
})
</script>
