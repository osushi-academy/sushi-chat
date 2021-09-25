<template>
  <div class="container page">
    <main>
      {{ room.title }}
      {{ room.description }}
      {{ room.state }}
      <p>管理者に招待されています</p>
      <button @click="regiaterAdmin">登録する</button>
    </main>
  </div>
</template>

<script lang="ts">
import Vue from "vue"
import VModal from "vue-js-modal"
import { RoomModel } from "~/../shared/dist"

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
    this.adminInviteKey = this.$route.query.adminInviteKey as string
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
        {
          pathname: "/room/:id/invited?admin_invite_key=:adminInviteKey",
          params: {
            id: this.roomId as string,
            adminInviteKey: this.adminInviteKey,
          },
        },
        {},
      )
      if (res.result === "error") {
        throw new Error("ルーム情報なし")
      }
      return { room: res.data }
    },
  },
})
</script>
