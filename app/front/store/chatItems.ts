import { Module, VuexModule, Mutation, Action } from "vuex-module-decorators"
import { PostChatItemRequest, ChatItemModel, ChatItemSenderType } from "sushi-chat-shared"
import getUUID from "~/utils/getUUID"
import { AuthStore, UserItemStore } from "~/store"
import buildSocket from "~/utils/socketIO"
import emitAsync from "~/utils/emitAsync"

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

  @Mutation
  public remove(chatItemId: string) {
    const index = this._chatItems.findIndex(({ id }) => id === chatItemId)
    this._chatItems.splice(index, 1)
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
  public async postMessage({
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
    const senderType: ChatItemSenderType = 
      UserItemStore.userItems.isAdmin? "admin" : 
      UserItemStore.userItems.speakerId === topicId? "speaker" :
      "general"
    // ローカルに反映する
    this.add({
      id: params.id,
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
    const socket = buildSocket(AuthStore.idToken)
    try {
      await emitAsync(socket, "POST_CHAT_ITEM", params)
      // TODO: 正しいタイムスタンプを設定する
    } catch (e) {
      // ローカルで追加したchatItemを削除する
      this.remove(params.id)
      throw e
    }
    console.log("send message: ", text)
  }

  @Action({ rawError: true })
  public async postReaction({ message }: { message: ChatItemModel }) {
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
      senderType: "general",
      iconId: UserItemStore.userItems.myIconId,
      timestamp: undefined,
      createdAt: new Date().toISOString(),
      quote: message,
    })
    // サーバーに反映する
    const socket = buildSocket(AuthStore.idToken)
    try {
      await emitAsync(socket, "POST_CHAT_ITEM", params)
      // TODO: 正しいタイムスタンプを設定する
    } catch (e) {
      // ローカルで追加したchatItemを削除する
      this.remove(params.id)
      throw e
    }
    console.log("send reaction: ", message.content)
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
    const params: PostChatItemRequest = {
      id: getUUID(),
      type: "question",
      topicId,
      content: text,
      quoteId: target?.id,
    }
    const senderType: ChatItemSenderType = 
      UserItemStore.userItems.isAdmin? "admin" : 
      UserItemStore.userItems.speakerId === topicId? "speaker" :
      "general"
    // ローカルに反映する
    this.add({
      id: params.id,
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
    const socket = buildSocket(AuthStore.idToken)
    try {
      await emitAsync(socket, "POST_CHAT_ITEM", params)
      // TODO: 正しいタイムスタンプを設定する
    } catch (e) {
      // ローカルで追加したchatItemを削除する
      this.remove(params.id)
      throw e
    }
    console.log("send question: ", text)
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
    const params: PostChatItemRequest = {
      id: getUUID(),
      type: "answer",
      topicId,
      quoteId: target.id,
      content: text,
    }
    const senderType: ChatItemSenderType = 
      UserItemStore.userItems.isAdmin? "admin" : 
      UserItemStore.userItems.speakerId === topicId? "speaker" :
      "general"
    // ローカルに反映する
    this.add({
      id: params.id,
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
    const socket = buildSocket(AuthStore.idToken)
    try {
      await emitAsync(socket, "POST_CHAT_ITEM", params)
      // TODO: 正しいタイムスタンプを設定する
    } catch (e) {
      // ローカルで追加したchatItemを削除する
      this.remove(params.id)
      throw e
    }
    console.log("send answer: ", text)
  }
}
