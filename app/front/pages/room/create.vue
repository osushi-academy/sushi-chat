<template>
  <div class="home-create">
    <header class="home-create__header">イベントの作成</header>
    <section class="home-create__event-name">
      <div class="home-create__event-name--title">1.イベント名の入力</div>
      <input v-model="roomName" class="home-create__event-name--input" />
    </section>
    <section class="home-create__room">
      <div class="home-create__room--title">2.ルームの登録</div>
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
                <div class="home-create__room__sessions__list--element--input">
                  <input v-model="list.name" placeholder="セッション名を入力" />
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
    <AddSessionsModal />
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
  sessionList: { name: string; id: number }[]
  isDragging: boolean
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
      sessionList: [
        { name: "いけおく", id: 0 },
        { name: "池奥", id: 1 },
        { name: "Ikeoku", id: 2 },
        { name: "寿司処いけおく", id: 3 },
        { name: "大乱闘いけおくブラザーズ", id: 4 },
      ],
      isDragging: false,
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
      this.sessionList.push({ name: "", id: this.sessionList.length - 1 })
    },
    removeSession(idx: number) {
      this.sessionList.splice(idx, 1)
    },
    async createRoom() {
      try {
        const sessions = this.sessionList
        const res = await this.$apiClient.post("/room", {
          name: this.roomName,
          topics: sessions,
          description: "hello, world",
        })

        if (res.result === "error") {
          throw new Error("エラーが発生しました")
        }

        console.log(res)
        // @ts-ignore
        const createdRoom = res.room[0]

        this.$modal.show("home-creation-completed-modal", {
          adminInviteKey: createdRoom.adminInviteKey,
        })
      } catch (e) {
        console.error(e)
        window.alert("エラーが発生しました")
      }
    },
  },
})
</script>
