import { Module, VuexModule, Mutation, Action } from 'vuex-module-decorators'
import socket from '~/utils/socketIO'
import { Answer, ChatItem, Message, Question } from '~/models/contents'
import {
  PostChatItemAnswerParams,
  PostChatItemMessageParams,
  PostChatItemQuestionParams,
  PostChatItemReactionParams,
} from '~/models/event'
import getUUID from '~/utils/getUUID'

@Module({
  name: 'chatItems',
  stateFactory: true,
  namespaced: true,
})
export default class ChatItems extends VuexModule {
  private _chatItems: ChatItem[] = []

  public get chatItems(): ChatItem[] {
    return this._chatItems
  }

  @Mutation
  public add(chatItem: ChatItem) {
    this._chatItems.push(chatItem)
  }

  @Mutation
  public addList(chatItems: ChatItem[]) {
    if (chatItems.length === 0) {
      return
    }
    this._chatItems.push(...chatItems)
  }

  @Mutation
  public update(chatItem: ChatItem) {
    this._chatItems = this._chatItems.map((item) =>
      item.id === chatItem.id ? chatItem : item
    )
  }

  @Action({ rawError: true })
  public addOrUpdate(chatItem: ChatItem) {
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
    topicId: string
    target?: Message | Answer
  }) {
    const params: PostChatItemMessageParams = {
      type: 'message',
      id: getUUID(),
      topicId,
      content: text,
      target: target?.id ?? null,
    }
    // ローカルに反映する
    this.add({
      id: params.id,
      type: 'message',
      topicId,
      iconId: '1', // TODO: 正しいアイコンを設定
      content: text,
      createdAt: new Date(),
      target: target ?? null,
      timestamp: 0, // TODO: 正しいタイムスタンプを設定する
    })
    // サーバーに送信する
    socket.emit('POST_CHAT_ITEM', params)
    console.log('send message: ', text)
  }

  @Action({ rawError: true })
  public postReaction({ message }: { message: Message | Question | Answer }) {
    const params: PostChatItemReactionParams = {
      id: getUUID(),
      topicId: message.topicId,
      type: 'reaction',
      reactionToId: message.id,
    }
    // ローカルに反映する
    this.add({
      id: params.id,
      topicId: message.topicId,
      type: 'reaction',
      iconId: '1', // TODO: 正しいアイコンを設定
      timestamp: 1100, // TODO: 正しいタイムスタンプを設定する
      createdAt: new Date(),
      target: message,
    })
    // サーバーに反映する
    socket.emit('POST_CHAT_ITEM', params)
    console.log('send reaction: ', message.content)
  }

  @Action({ rawError: true })
  public postQuestion({ text, topicId }: { text: string; topicId: string }) {
    const params: PostChatItemQuestionParams = {
      type: 'question',
      id: getUUID(),
      topicId,
      content: text,
    }
    // ローカルに反映する
    this.add({
      id: params.id,
      type: 'question',
      topicId,
      iconId: '1', // TODO: 正しいアイコンを設定
      content: text,
      createdAt: new Date(),
      timestamp: 60000, // TODO: 正しいタイムスタンプを設定する
    })
    // サーバーに反映する
    socket.emit('POST_CHAT_ITEM', params)
    console.log('send question: ', text)
  }

  @Action({ rawError: true })
  public postAnswer({
    text,
    topicId,
    target,
  }: {
    text: string
    topicId: string
    target: Question
  }) {
    const params: PostChatItemAnswerParams = {
      id: getUUID(),
      topicId,
      type: 'answer',
      target: target.id,
      content: text,
    }
    // サーバーに反映する
    socket.emit('POST_CHAT_ITEM', params)
    // ローカルに反映する
    this.add({
      id: params.id,
      topicId,
      type: 'answer',
      iconId: '1', // TODO: 正しいアイコンを設定
      timestamp: 1100, // TODO: 正しいタイムスタンプを設定する
      createdAt: new Date(),
      target,
      content: text,
    })
    console.log('send answer: ', text)
  }
}
