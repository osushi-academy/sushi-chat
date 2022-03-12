import { Module, VuexModule, Mutation, Action } from "vuex-module-decorators"
import { ChatItemModel, ChatItemSenderType } from "sushi-chat-shared"
import getUUID from "~/utils/getUUID"
import { UserItemStore } from "~/store"
import buildSocket from "~/utils/socketIO"
import emitAsync from "~/utils/emitAsync"

/**
 * メッセージの通信状態
 * - success: 送信成功 or サーバから配信されたメッセージ
 * - failure: 送信失敗
 * - loading: 送信中
 */
export type ChatItemStatus = "success" | "failure" | "loading"
export type ChatItemWithStatus = ChatItemModel & {
  status: ChatItemStatus
}

@Module({
  name: "chatItems",
  stateFactory: true,
  namespaced: true,
})
export default class ChatItems extends VuexModule {
  private _chatItems: ChatItemWithStatus[] = []

  public get chatItems(): ChatItemWithStatus[] {
    return this._chatItems
  }

  @Mutation
  public add(chatItem: ChatItemWithStatus) {
    this._chatItems.push(chatItem)
  }

  @Mutation
  public setChatItems(chatItems: ChatItemWithStatus[]) {
    this._chatItems = chatItems
  }

  @Mutation
  public addList(chatItems: ChatItemWithStatus[]) {
    if (chatItems.length === 0) {
      return
    }
    this._chatItems.push(...chatItems)
  }

  @Mutation
  public update(chatItem: ChatItemWithStatus) {
    this._chatItems = this._chatItems.map((item) =>
      item.id === chatItem.id ? chatItem : item,
    )
  }

  @Mutation
  public updateStatus({ id, status }: { id: string; status: ChatItemStatus }) {
    this._chatItems = this._chatItems.map((item) =>
      item.id === id ? { ...item, status } : item,
    )
  }

  @Mutation
  public remove(chatItemId: string) {
    const index = this._chatItems.findIndex(({ id }) => id === chatItemId)
    this._chatItems.splice(index, 1)
  }

  @Action({ rawError: true })
  public addOrUpdate(chatItem: ChatItemWithStatus) {
    if (this._chatItems.find(({ id }) => id === chatItem.id)) {
      this.update(chatItem)
    } else {
      this.add(chatItem)
    }
  }

  @Action({ rawError: true })
  public async postMessage({
    text,
    topicId,
    target,
  }: {
    text: string
    topicId: number
    target?: ChatItemModel
  }) {
    const id = getUUID()
    const isAdmin = UserItemStore.userItems.isAdmin

    const senderType: ChatItemSenderType = isAdmin
      ? "admin"
      : UserItemStore.userItems.speakerId === topicId
      ? "speaker"
      : "general"

    // ローカルに反映する
    this.add({
      id,
      status: "loading",
      topicId,
      type: "message",
      senderType,
      iconId: UserItemStore.userItems.myIconId,
      content: text,
      createdAt: new Date().toISOString(),
      quote: target,
      timestamp: undefined,
    })

    // サーバーに送信する
    const socket = await buildSocket(isAdmin)
    try {
      await emitAsync(socket, "POST_CHAT_ITEM", {
        id,
        type: "message",
        topicId,
        content: text,
        quoteId: target?.id,
      })
      console.log("send message: ", text)
    } catch (e) {
      this.updateStatus({ id, status: "failure" })
    }
  }

  @Action({ rawError: true })
  public async postReaction({ message }: { message: ChatItemModel }) {
    const id = getUUID()
    const isAdmin = UserItemStore.userItems.isAdmin

    // ローカルに反映する
    this.add({
      id,
      status: "loading",
      topicId: message.topicId,
      type: "reaction",
      senderType: "general",
      iconId: UserItemStore.userItems.myIconId,
      timestamp: undefined,
      createdAt: new Date().toISOString(),
      quote: message,
    })
    // サーバーに反映する
    const socket = await buildSocket(isAdmin)
    try {
      await emitAsync(socket, "POST_CHAT_ITEM", {
        id,
        type: "reaction",
        topicId: message.topicId,
        quoteId: message.id,
      })
      console.log("send reaction: ", message.content)
    } catch (e) {
      this.updateStatus({ id, status: "failure" })
    }
  }

  @Action({ rawError: true })
  public async postQuestion({
    text,
    topicId,
    target,
  }: {
    text: string
    topicId: number
    target?: ChatItemModel
  }) {
    const id = getUUID()
    const isAdmin = UserItemStore.userItems.isAdmin

    const senderType: ChatItemSenderType = isAdmin
      ? "admin"
      : UserItemStore.userItems.speakerId === topicId
      ? "speaker"
      : "general"

    // ローカルに反映する
    this.add({
      id,
      status: "loading",
      topicId,
      type: "question",
      senderType,
      iconId: UserItemStore.userItems.myIconId,
      content: text,
      createdAt: new Date().toISOString(),
      timestamp: undefined,
      quote: target,
    })
    // サーバーに反映する
    const socket = await buildSocket(isAdmin)
    try {
      await emitAsync(socket, "POST_CHAT_ITEM", {
        id,
        type: "question",
        topicId,
        content: text,
        quoteId: target?.id,
      })
      console.log("send question: ", text)
    } catch (e) {
      this.updateStatus({ id, status: "failure" })
    }
  }

  @Action({ rawError: true })
  public async postAnswer({
    text,
    topicId,
    target,
  }: {
    text: string
    topicId: number
    target: ChatItemModel
  }) {
    const id = getUUID()
    const isAdmin = UserItemStore.userItems.isAdmin

    const senderType: ChatItemSenderType = UserItemStore.userItems.isAdmin
      ? "admin"
      : UserItemStore.userItems.speakerId === topicId
      ? "speaker"
      : "general"
    // ローカルに反映する
    this.add({
      id,
      status: "loading",
      topicId,
      type: "answer",
      senderType,
      iconId: UserItemStore.userItems.myIconId,
      timestamp: undefined,
      createdAt: new Date().toISOString(),
      quote: target || null,
      content: text,
    })
    // サーバーに反映する
    const socket = await buildSocket(isAdmin)
    try {
      await emitAsync(socket, "POST_CHAT_ITEM", {
        id,
        type: "answer",
        topicId,
        quoteId: target.id,
        content: text,
      })
      console.log("send answer: ", text)
    } catch (e) {
      this.updateStatus({ id, status: "failure" })
    }
  }

  @Action({ rawError: true })
  public async retrySendChatItem({ chatItem }: { chatItem: ChatItemModel }) {
    const isAdmin = UserItemStore.userItems.isAdmin
    const socket = await buildSocket(isAdmin)
    this.updateStatus({ id: chatItem.id, status: "loading" })
    try {
      await emitAsync(socket, "POST_CHAT_ITEM", chatItem)
      console.log("retry send chatItem: ", chatItem.content)
    } catch (e) {
      this.updateStatus({ id: chatItem.id, status: "failure" })
    }
  }
}
