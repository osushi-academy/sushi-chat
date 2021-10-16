import { Middleware } from "@nuxt/types"

const privateRoute: Middleware = ({ store, redirect }) => {
  if (!store.getters["auth/isLoggedIn"]) {
    return redirect("/")
  }
}

export default privateRoute
