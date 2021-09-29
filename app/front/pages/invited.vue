<template>
  <div class="container page">
    <main>
      <div class="sushi-select not-started">
        <div class="not-started__title">管理者に招待されています</div>
        <div class="not-started__textbox">
          <div class="not-started__textbox--title">{{ room.title }}</div>
          <div>
            {{ room.description }}
          </div>
          {{ room.state === "ongoing" ? "ルーム開催中" : "ルーム開始前" }}
        </div>
        <div class="not-started__button">
          <button @click="regiaterAdmin">招待を受ける</button>
        </div>
      </div>
      <InviteSuccess />
    </main>
  </div>
</template>

<script lang="ts">
import Vue from "vue"
import VModal from "vue-js-modal"
import { RoomModel } from "~/../shared/dist"
import InviteSuccess from "@/components/Home/InviteSuccess.vue"

// Data型
type DataType = {
  // ルーム情報
  room: RoomModel
  roomId: string
  adminInviteKey: string
}
Vue.use(VModal)
export default Vue.extend({
  name: "Invited",
  components: {
    InviteSuccess,
  },
  async asyncData({ app, query }) {
    const res = await app.$apiClient.get(
      {
        pathname: "/room/:id",
        params: { id: query.roomId as string },
      },
      {},
    )
    if (res.result === "error") {
      throw new Error("ルーム情報なし")
    }
    return { room: res.data }
  },
  data(): DataType {
    return { room: {} as RoomModel, roomId: "", adminInviteKey: "" }
  },
  created(): any {
    // roomId取得
    this.roomId = this.$route.query.roomId as string
    // adminInviteKey取得
    this.adminInviteKey = this.$route.query.admin_invite_key as string
  },
  mounted(): any {
    // roomId取得
    this.roomId = this.$route.query.roomId as string
    if (this.roomId !== "") {
      // TODO: this.room.idが存在しない→404
    }
  },
  methods: {
    async regiaterAdmin() {
      const res = await this.$apiClient.post(
        // @ts-ignore
        `/room/${this.roomId}/invited?admin_invite_key=${this.adminInviteKey}`,
        {},
      )
      if (res.result === "error") {
        window.alert("処理に失敗しました")
        throw new Error("管理者招待失敗")
      }
      console.log({
        title: this.room.title,
        id: this.room.id,
        adminInviteKey: this.room.adminInviteKey,
      })
      this.$modal.show("home-invite-success-modal", {
        title: this.room.title,
        id: this.room.id,
        adminInviteKey: this.room.adminInviteKey,
      })
    },
  },
})
</script>
