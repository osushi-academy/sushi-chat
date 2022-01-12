import { Plugin } from "@nuxt/types"
import buildSocket, { SocketIOType } from "~/utils/socketIO"

const socketPlugin: Plugin = (_, inject) => {
  // socketを初期化する
  const socket = new Promise<SocketIOType>((resolve) => {
    inject("initSocket", async (asAdmin: boolean) => {
      const socket: SocketIOType = await buildSocket(asAdmin)
      resolve(socket)
    })
  })
  // socketを取得する
  inject("socket", async () => await socket)
}

export default socketPlugin

declare module "vue/types/vue" {
  interface Vue {
    readonly $initSocket: (asAdmin?: boolean) => void
    readonly $socket: () => Promise<SocketIOType>
  }
}

declare module "@nuxt/types" {
  interface NuxtAppOptions {
    readonly $initSocket: (idToken?: boolean) => void
    readonly $socket: () => Promise<SocketIOType>
  }

  interface Context {
    readonly $initSocket: (asAdmin?: boolean) => void
    readonly $socket: () => Promise<SocketIOType>
  }
}
