<template>
  <div class="container page">
    <main>
      <p>招待されています</p>
    </main>
  </div>
</template>

<script lang="ts">
import Vue from "vue"
import VModal from "vue-js-modal"
import { RoomModel } from "~/../shared/dist"
import { DeviceStore, UserItemStore } from "~/store"

// Data型
type DataType = {
  // ルーム情報
  room: RoomModel
  roomId: string
}
Vue.use(VModal)
export default Vue.extend({
  name: "Invited",
  async asyncData({ app }) {
    const res = await app.$apiClient.get(
      {
        pathname: "/room/:id",
        params: { id: roomId },
      },
      {},
    )
    if (res.result === "error") {
      throw new Error("招待失敗")
    }
    return { room: res.data }
  },
  data(): DataType {
    return { room: null, roomId: "" }
  },
  mounted(): any {
    // roomId取得
    this.roomId = this.$route.query.roomId as string
    if (this.roomId !== "") {
      // TODO: this.room.idが存在しない→404
    }
  },
})
</script>
