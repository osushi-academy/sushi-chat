<template>
  <div class="home-create">
    <header class="home-create__header">イベントの作成</header>
    <section class="home-create__event-name">
      <div class="home-create__event-name--title">1. イベント名の入力</div>
      <input
        v-model="roomName"
        class="home-create__event-name--input"
        placeholder="イベント名"
      />
    </section>
    <section class="home-create__room">
      <div class="home-create__room--title">2. セッションの登録</div>
      <div class="home-create__room__sessions">
        <div class="home-create__room__sessions__index">
          <div v-for="num in sessionList.length" :key="num">
            <div class="home-create__room__sessions__index--element">
              {{ num }}.
            </div>
          </div>
        </div>
        <div class="home-create__room__sessions__list">
          <draggable
            :list="sessionList"
            handle=".home-create__room__sessions__list--element--sort"
            v-bind="dragOptions"
            @start="isDragging = true"
            @end="isDragging = false"
          >
            <transition-group
              type="transition"
              :name="!isDragging ? 'flip-list' : null"
            >
              <div
                v-for="(list, idx) in sessionList"
                :key="idx"
                class="home-create__room__sessions__list--element"
              >
                <div class="home-create__room__sessions__list--element--input">
                  <input
                    v-model="list.title"
                    placeholder="セッション名を入力"
                  />
                  <div
                    class="home-create__room__sessions__list--element--remove"
                    @click="removeSession(idx)"
                  >
                    <span class="material-icons"> remove </span>
                  </div>
                </div>
                <span
                  class="home-create__room__sessions__list--element--sort"
                  :class="{
                    'home-create__room__sessions__list--element--sort--dragging':
                      isDragging === true,
                  }"
                >
                  <span class="material-icons">menu</span>
                </span>
              </div>
            </transition-group>
          </draggable>
        </div>
      </div>
      <div class="home-create__room__add">
        <div class="home-create__room__add--button" @click="addSession">
          <span class="material-icons"> add </span>セッションを追加
        </div>
        <div
          class="home-create__room__add--collective-button"
          @click="$modal.show('home-add-sessions-modal')"
        >
          <span class="material-icons"> add </span>まとめて追加
        </div>
      </div>
    </section>
    <button class="home-create__create-new-event-button" @click="createRoom">
      この内容で作成
    </button>
    <AddSessionsModal @separate-topics="separateTopics" />
    <CreationCompletedModal />
  </div>
</template>

<script lang="ts">
import Vue from "vue"
import VModal from "vue-js-modal"
import draggable from "vuedraggable"
import AddSessionsModal from "@/components/Home/AddSessionsModal.vue"
import CreationCompletedModal from "@/components/Home/CreationCompletedModal.vue"

Vue.use(VModal)
type DataType = {
  roomName: string
  sessionList: { title: string }[]
  isDragging: boolean
  MAX_TOPIC_LENGTH: number
}
export default Vue.extend({
  name: "HomeEventCreate",
  components: {
    AddSessionsModal,
    CreationCompletedModal,
    draggable,
  },
  layout: "home",
  data(): DataType {
    return {
      roomName: "",
      sessionList: [{ title: "" }],
      isDragging: false,
      MAX_TOPIC_LENGTH: 100,
    }
  },
  computed: {
    dragOptions() {
      return {
        animation: 200,
        group: "description",
        disabled: false,
        ghostClass: "ghost",
      }
    },
  },
  methods: {
    addSession() {
      this.sessionList.push({ title: "" })
    },
    removeSession(idx: number) {
      this.sessionList.splice(idx, 1)
    },
    // textareaに入力された文字を改行で区切ってTopic追加
    separateTopics(titles: string[]) {
      // titleが空のsessionListを削除
      this.sessionList = this.sessionList.filter(({ title }) => title !== "")

      // 追加済みTopic名リスト作成
      const set = new Set<string>()
      for (const topic of this.sessionList.slice(0, this.sessionList.length)) {
        set.add(topic.title)
      }

      for (const topicTitle of titles) {
        // 空文字はカウントしない
        if (topicTitle === "") continue
        // 重複しているトピックはカウントしない
        if (set.has(topicTitle)) continue
        // 長さ制限を超えている
        if (topicTitle.length > this.MAX_TOPIC_LENGTH) {
          alert("セッション名は" + this.MAX_TOPIC_LENGTH + "文字までです。")
          return
        }
        const t: { title: string } = { title: topicTitle }
        set.add(topicTitle)
        this.sessionList.push(t)
      }
      this.$modal.hide("home-add-sessions-modal")
    },
    // ルーム作成
    async createRoom() {
      try {
        // titleのないセッションは無視
        const sessions = this.sessionList.filter(
          (session) => session.title !== "",
        )
        // room名とセッションが不足していたらエラー
        if (this.roomName === "" || sessions.length === 0) {
          throw new Error("入力が不足しています")
        }

        const res = await this.$apiClient.post("/room", {
          title: this.roomName,
          topics: sessions,
          description: "hello, world",
        })

        if (res.result === "error") {
          throw new Error("エラーが発生しました")
        }

        const createdRoom = res.data

        this.$modal.show("home-creation-completed-modal", {
          title: createdRoom.title,
          id: createdRoom.id,
          adminInviteKey: createdRoom.adminInviteKey,
        })
      } catch (e) {
        console.error(e)
        window.alert(e.message ?? "不明なエラーが発生しました")
      }
    },
  },
})
</script>
