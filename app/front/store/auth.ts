import { Module, VuexModule, Action, Mutation } from "vuex-module-decorators"
import firebase from "firebase"

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
  private _idToken: string | null = null

  public get authUser() {
    return this._authUser
  }

  public get idToken() {
    return this._idToken
  }

  public get isLoggedIn() {
    return this._authUser != null && this._idToken != null
  }

  @Mutation
  private setAuthUser(authUser: AuthUser | null) {
    this._authUser = authUser
  }

  @Mutation
  private setIdToken(idToken: string) {
    this._idToken = idToken
  }

  @Action({ rawError: true })
  public async onIdTokenChangedAction(res: { authUser?: firebase.User }) {
    if (res.authUser == null) {
      this.setAuthUser(null)
      return
    }
    const { uid, email, displayName, photoURL, emailVerified } = res.authUser
    this.setAuthUser({ uid, email, displayName, photoURL, emailVerified })
    const idToken = await res.authUser.getIdToken()
    this.setIdToken(idToken)
  }
}
