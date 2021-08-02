import { Module, VuexModule, Mutation } from "vuex-module-decorators"
import { DeviceType } from "~/models/contents"

@Module({
  name: "device",
  stateFactory: true,
  namespaced: true,
})
export default class Device extends VuexModule {
  private _device: DeviceType = "windows"

  public get device(): DeviceType {
    return this._device
  }

  @Mutation
  public determineOs() {
    // OS判定
    const os = window.navigator.userAgent.toLowerCase()
    if (os.includes("windows nt")) {
      this._device = "windows"
    } else if (os.includes("android")) {
      this._device = "smartphone"
    } else if (os.includes("iphone") || os.includes("ipad")) {
      this._device = "smartphone"
    } else if (os.includes("mac os x")) {
      this._device = "mac"
    } else {
      this._device = "windows"
    }
  }
}
