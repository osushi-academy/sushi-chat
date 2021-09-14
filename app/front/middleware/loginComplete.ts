import { Middleware } from "@nuxt/types"

const getRedirectAuthResult: Middleware = async ({ app }) => {
  await app.$fire.auth.getRedirectResult()
}

export default getRedirectAuthResult
