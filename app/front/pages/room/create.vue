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
                :key="list.id"
                class="home-create__room__sessions__list--element"
              >
                <form
                  class="home-create__room__sessions__list--element--input"
                  @submit="onClickEnterInSessionInput($event, idx)"
                >
                  <input
                    ref="sessionInputs"
                    v-model="list.title"
                    placeholder="セッション名を入力"
                    @keydown.up="moveFocus(idx, 'up')"
                    @keydown.down="moveFocus(idx, 'down')"
                    @keydown.esc="
                      removeSessionAndMoveFocus(
                        $event,
                        idx,
                        idx === sessionList.length - 1 ? 'up' : 'down',
                      )
                    "
                    @keydown.delete="
                      if (sessionList[idx].title.length === 0) {
                        removeSessionAndMoveFocus($event, idx, 'up')
                      }
                    "
                  />
                  <button
                    type="button"
                    class="home-create__room__sessions__list--element--remove"
                    :disabled="!canDeleteSessionInput"
                    @click="removeSession(idx)"
                  >
                    <MinusCircleIcon size="1.2x"></MinusCircleIcon>
                  </button>
                </form>
                <button
                  class="home-create__room__sessions__list--element--sort"
                  :class="{
                    'home-create__room__sessions__list--element--sort--dragging':
                      isDragging === true,
                  }"
                >
                  <MenuIcon size="1.2x"></MenuIcon>
                </button>
              </div>
            </transition-group>
          </draggable>
        </div>
      </div>
      <div class="home-create__room__add">
        <button
          class="home-create__room__add--button"
          @click="() => addSession()"
        >
          <PlusIcon class="icon" :size="20"></PlusIcon>
          セッションを追加
        </button>
        <button
          class="home-create__room__add--collective-button"
          @click="$modal.show('home-add-sessions-modal')"
        >
          <PlusIcon class="icon" :size="20"></PlusIcon>
          まとめて追加
        </button>
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
import PlusIcon from "vue-material-design-icons/Plus.vue"
import { MenuIcon, MinusCircleIcon } from "vue-feather-icons"
import AddSessionsModal from "@/components/Home/AddSessionsModal.vue"
import CreationCompletedModal from "@/components/Home/CreationCompletedModal.vue"

Vue.use(VModal)
type DataType = {
  roomName: string
  sessionList: { title: string; id: number }[]
  isDragging: boolean
  MAX_TOPIC_LENGTH: number
}

let sessionId = 0

export default Vue.extend({
  name: "HomeEventCreate",
  components: {
    AddSessionsModal,
    CreationCompletedModal,
    draggable,
    PlusIcon,
    MenuIcon,
    MinusCircleIcon,
  },
  layout: "home",
  data(): DataType {
    return {
      roomName: "",
      sessionList: [{ title: "", id: sessionId++ }],
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
    canDeleteSessionInput(): boolean {
      return this.sessionList.length > 1
    },
  },
  methods: {
    // idx番目に新しいセッションInputを追加する
    addSession(idx?: number) {
      const newIndex = idx ?? this.sessionList.length
      this.sessionList.splice(newIndex, 0, {
        title: "",
        id: sessionId++,
      })

      // 新しく追加したセッションInputにフォーカスを当てる
      Vue.nextTick(() => {
        // @ts-ignore
        this.getRefElementWithIdx(this.$refs.sessionInputs.length - 1)?.focus()
      })
    },
    removeSession(idx: number) {
      if (!this.canDeleteSessionInput) return
      this.sessionList.splice(idx, 1)
    },
    removeSessionAndMoveFocus(e: Event, idx: number, direction: "up" | "down") {
      e.preventDefault()
      this.moveFocus(idx, direction)
      this.removeSession(idx)
    },
    // 矢印の上下キーで、上下のセッションInputに移動する
    moveFocus(idx: number, direction: "up" | "down") {
      this.getRefElementWithIdx(idx + (direction === "up" ? -1 : 1))?.focus()
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
        const t = {
          title: topicTitle,
          id: sessionId++,
        }
        set.add(topicTitle)
        this.sessionList.push(t)
      }
      this.$modal.hide("home-add-sessions-modal")
    },
    // 入力末尾でEnterを押したら、自動で次のinputを追加する
    onClickEnterInSessionInput(e: Event, idx: number) {
      e.preventDefault()
      const inputElement = this.getRefElementWithIdx(idx)
      // 現在キャレットが末尾にあるか判定する
      if (inputElement.selectionEnd === this.sessionList[idx].title.length) {
        this.addSession(idx + 1)
      }
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
          topics: sessions.map(({ title }) => ({ title })), // titleのみの配列に変換
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
    /**
     * this.sessionListのidxの要素に対応するinput要素をthis.$refsから取得する関数
     * @params idx idx
     * @return 対応するinput要素
     */
    getRefElementWithIdx(idx: number) {
      const nextId = this.sessionList[idx]?.id
      if (nextId == null) return
      const sortedIds = this.sessionList
        .map(({ id }) => id)
        .sort((a, b) => (a > b ? 1 : a === b ? 0 : -1))
      const targetId = sortedIds.findIndex((id) => id === nextId)
      if (targetId < 0) return null
      // @ts-ignore
      return this.$refs.sessionInputs[targetId]
    },
  },
})
</script>
