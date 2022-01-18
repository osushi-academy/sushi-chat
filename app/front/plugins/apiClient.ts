import { Plugin } from "@nuxt/types"
import ApiClient from "~/apiClient"

const repositoryPlugin: Plugin = (context, inject) => {
  const axios = context.$axios.create({
    timeout: 10 * 1000,
  })

  const apiClient = new ApiClient(axios)

  inject("apiClient", apiClient)
}

export default repositoryPlugin

declare module "vue/types/vue" {
  interface Vue {
    readonly $apiClient: ApiClient
  }
}

declare module "@nuxt/types" {
  interface NuxtAppOptions {
    readonly $apiClient: ApiClient
  }

  interface Context {
    readonly $apiClient: ApiClient
  }
}
