import { Module, VuexModule, Mutation, Action } from "vuex-module-decorators"
import { PostChatItemRequest, ChatItemModel } from "sushi-chat-shared"
import getUUID from "~/utils/getUUID"
import { AuthStore, UserItemStore } from "~/store"
import buildSocket from "~/utils/socketIO"

@Module({
  name: "chatItems",
  stateFactory: true,
  namespaced: true,
})
export default class ChatItems extends VuexModule {
  private _chatItems: ChatItemModel[] = []

  public get chatItems(): ChatItemModel[] {
    return this._chatItems
  }

  @Mutation
  public add(chatItem: ChatItemModel) {
    this._chatItems.push(chatItem)
  }

  @Mutation
  public setChatItems(chatItems: ChatItemModel[]) {
    this._chatItems = chatItems
  }

  @Mutation
  public addList(chatItems: ChatItemModel[]) {
    if (chatItems.length === 0) {
      return
    }
    this._chatItems.push(...chatItems)
  }

  @Mutation
  public update(chatItem: ChatItemModel) {
    this._chatItems = this._chatItems.map((item) =>
      item.id === chatItem.id ? chatItem : item,
    )
  }

  @Action({ rawError: true })
  public addOrUpdate(chatItem: ChatItemModel) {
    if (this._chatItems.find(({ id }) => id === chatItem.id)) {
      this.update(chatItem)
    } else {
      this.add(chatItem)
    }
  }

  @Action({ rawError: true })
  public postMessage({
    text,
    topicId,
    target,
  }: {
    text: string
    topicId: number
    target?: ChatItemModel
  }) {
    const params: PostChatItemRequest = {
      id: getUUID(),
      type: "message",
      topicId,
      content: text,
      quoteId: target?.id,
    }
    // ローカルに反映する
    this.add({
      id: params.id,
      topicId,
      type: "message",
      senderType: "general", // TODO: senderType取得
      iconId: UserItemStore.userItems.myIconId,
      content: text,
      createdAt: new Date().toISOString(),
      quote: target,
      timestamp: 0, // TODO: 正しいタイムスタンプを設定する
    })
    // サーバーに送信する
    const socket = buildSocket(AuthStore.idToken)
    socket.emit("POST_CHAT_ITEM", params, (res) => {
      console.log(res)
    })
    console.log("send reaction: ", text)
  }

  @Action({ rawError: true })
  public postReaction({ message }: { message: ChatItemModel }) {
    const params: PostChatItemRequest = {
      id: getUUID(),
      type: "reaction",
      topicId: message.topicId,
      quoteId: message.id,
    }
    // ローカルに反映する
    this.add({
      id: params.id,
      topicId: message.topicId,
      type: "reaction",
      senderType: "general", // TODO: senderType取得
      iconId: UserItemStore.userItems.myIconId,
      timestamp: 1100, // TODO: 正しいタイムスタンプを設定する
      createdAt: new Date().toISOString(),
      quote: message,
    })
    // サーバーに反映する
    const socket = buildSocket(AuthStore.idToken)
    socket.emit("POST_CHAT_ITEM", params, (res) => {
      console.log(res)
    })
    console.log("send reaction: ", message.content)
  }

  @Action({ rawError: true })
  public postQuestion({ text, topicId }: { text: string; topicId: number }) {
    const params: PostChatItemRequest = {
      id: getUUID(),
      type: "question",
      topicId,
      content: text,
    }
    // ローカルに反映する
    this.add({
      id: params.id,
      topicId,
      type: "question",
      senderType: "general", // TODO: senderType取得
      iconId: UserItemStore.userItems.myIconId,
      content: text,
      createdAt: new Date().toISOString(),
      timestamp: 60000, // TODO: 正しいタイムスタンプを設定する
    })
    // サーバーに反映する
    const socket = buildSocket(AuthStore.idToken)
    socket.emit("POST_CHAT_ITEM", params, (res) => {
      console.log(res)
    })
    console.log("send question: ", text)
  }

  @Action({ rawError: true })
  public postAnswer({
    text,
    topicId,
    target,
  }: {
    text: string
    topicId: number
    target: ChatItemModel
  }) {
    const params: PostChatItemRequest = {
      id: getUUID(),
      type: "answer",
      topicId,
      quoteId: target.id,
      content: text,
    }
    // サーバーに反映する
    const socket = buildSocket(AuthStore.idToken)
    socket.emit("POST_CHAT_ITEM", params, (res) => {
      console.log(res)
    })
    // ローカルに反映する
    this.add({
      id: params.id,
      topicId,
      type: "answer",
      senderType: "general", // TODO: senderType取得
      iconId: UserItemStore.userItems.myIconId,
      timestamp: 1100, // TODO: 正しいタイムスタンプを設定する
      createdAt: new Date().toISOString(),
      quote: target || null,
      content: text,
    })
    console.log("send answer: ", text)
  }
}
