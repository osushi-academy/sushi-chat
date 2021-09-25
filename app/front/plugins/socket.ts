import { Plugin } from "@nuxt/types"
import buildSocket, { SocketIOType } from "~/utils/socketIO"
const socketPlugin: Plugin = (context, inject) => {
  let socket: SocketIOType | null = null
  // socketを初期化する
  inject("initSocket", (asAdmin: boolean) => {
    socket = buildSocket(asAdmin ? context.store.state.auth._idToken : null)
  })
  // socketを取得する
  inject("socket", () => socket)
}

export default socketPlugin

declare module "vue/types/vue" {
  interface Vue {
    readonly $initSocket: (asAdmin?: boolean) => void
    readonly $socket: () => SocketIOType
  }
}

declare module "@nuxt/types" {
  interface NuxtAppOptions {
    readonly $initSocket: (idToken?: boolean) => void
    readonly $socket: () => SocketIOType
  }

  interface Context {
    readonly $initSocket: (asAdmin?: boolean) => void
    readonly $socket: () => SocketIOType
  }
}
