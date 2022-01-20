import { Middleware } from "@nuxt/types"
import { AuthStore } from "~/store"

const privateRoute: Middleware = ({ redirect }) => {
  if (!AuthStore.isLoggedIn) {
    return redirect("/login")
  }
}

export default privateRoute
