import { Module, VuexModule, Action, Mutation } from "vuex-module-decorators"
import type firebase from "firebase/app"

type AuthUser = {
  uid: string
  email: string | null
  displayName: string | null
  photoURL: string | null
  emailVerified: boolean
}

@Module({
  name: "auth",
  stateFactory: true,
  namespaced: true,
})
export default class Auth extends VuexModule {
  private _authUser: AuthUser | null = null

  public get authUser() {
    return this._authUser
  }

  public get isLoggedIn() {
    return this._authUser != null
  }

  @Mutation
  private setAuthUser(authUser: AuthUser | null) {
    this._authUser = authUser
  }

  @Action({ rawError: true })
  public onIdTokenChangedAction({ authUser }: { authUser?: firebase.User }) {
    if (authUser == null) {
      this.setAuthUser(null)
      return
    }
    const { uid, email, displayName, photoURL, emailVerified } = authUser
    this.setAuthUser({ uid, email, displayName, photoURL, emailVerified })
  }
}
