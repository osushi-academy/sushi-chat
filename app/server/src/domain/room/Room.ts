import {
  Answer,
  AnswerStore,
  ChatItem,
  ChatItemStore,
  Message,
  Question,
  QuestionStore,
  User,
} from "../../chatItem"
import { AdminChangeTopicStateParams } from "../../events"
import { v4 as uuid } from "uuid"
import ChatItemClass from "../chatItem/ChatItem"
import StampClass from "../stamp/Stamp"
import MessageClass from "../chatItem/Message"
import UserClass from "../user/User"
import Topic from "./Topic"

class RoomClass {
  private users: User[] = []
  private chatItems: ChatItemStore[] = []
  public topics: Topic[]
  private stamps: StampClass[] = []
  private isOpened = false

  /**
   * @var {number} topicTimeData.openedDate トピックの開始時刻
   * @var {number} topicTimeData.pausedDate トピックが最後に一時停止された時刻
   * @var {number} topicTimeData.offsetTime トピックが一時停止されていた総時間
   */
  private topicTimeData: Record<
    string,
    { openedDate: number | null; pausedDate: number | null; offsetTime: number }
  > = {}

  public get activeUserCount(): number {
    return this.users.length
  }

  public getChatItems = () => this.chatItems.map(this.chatItemStoreToChatItem)

  public calcTimestamp = (topicId: string): number => {
    const openedDate = this.findOpenedDateOrThrow(topicId)
    const offsetTime = this.topicTimeData[topicId].offsetTime
    const timestamp = new Date().getTime() - openedDate - offsetTime

    return Math.max(timestamp, 0)
  }

  constructor(
    public readonly id: string,
    public readonly title: string,
    topics: Omit<Topic, "id" | "state">[],
  ) {
    this.topics = topics.map((topic, i) => ({
      ...topic,
      id: `${i + 1}`,
      state: "not-started",
    }))
    this.topics.forEach(({ id }) => {
      this.topicTimeData[id] = {
        openedDate: null,
        pausedDate: null,
        offsetTime: 0,
      }
    })
  }

  /**
   * ルームを開始する
   */
  public startRoom = () => {
    if (this.isOpened) {
      throw new Error("[sushi-chat-server] Room has already opened.")
    }
    this.isOpened = true
  }

  public finishRoom = () => {
    // TODO: startRoomと同じようにthis.isOpenedのチェックした方がいい気がする
    this.isOpened = false
  }

  public closeRoom = () => {
    // TODO: startRoomと同じようにthis.isOpenedのチェックした方がいい気がする
    this.isOpened = false
  }

  /**
   * ユーザーがルームに参加した場合に呼ばれる関数
   * @param userId
   * @param iconId
   * @returns
   */
  public joinUser = (userId: string, iconId: string): number => {
    this.users.push({ id: userId, iconId })

    return this.activeUserCount
  }

  /**
   * ユーザーがルームから退室した場合に呼ばれる関数
   * @param userId
   */
  public leaveUser = (userId: string): number => {
    const leftUser = this.users.find((user) => user.id === userId)
    if (leftUser == null) {
      throw new Error(
        `[sushi-chat-server] User(id: ${userId}) does not exists.`,
      )
    }
    this.users = this.users.filter((user) => user.id !== leftUser.id)

    return this.activeUserCount
  }

  /**
   * トピックの状態を変更するときに呼ばれる関数
   */
  public changeTopicState = (
    params: AdminChangeTopicStateParams,
  ): { messages: MessageClass[]; activeTopic: Topic | null } => {
    if (!this.isOpened) {
      throw new Error("[sushi-chat-server] Room is not opened.")
    }

    const targetTopic = this.getTopicById(params.topicId)
    if (targetTopic == null) {
      throw new Error("[sushi-chat-server] Topic does not exists.")
    }

    if (params.type === "OPEN") {
      const messages: MessageClass[] = []

      // 現在activeであるトピックをfinishedする
      const currentActiveTopic = this.activeTopic
      if (currentActiveTopic != null) {
        currentActiveTopic.state = "finished"
        const message = this.finishTopic(currentActiveTopic.id)
        messages.push(message)
      }

      // 指定されたトピックをOpenにする
      targetTopic.state = "active"

      const isFirstOpen = this.topicTimeData[targetTopic.id].openedDate == null

      // タイムスタンプの計算
      if (isFirstOpen) {
        this.topicTimeData[targetTopic.id].openedDate = new Date().getTime()
      }
      const pausedDate = this.topicTimeData[targetTopic.id].pausedDate
      if (pausedDate != null) {
        this.topicTimeData[targetTopic.id].offsetTime +=
          new Date().getTime() - pausedDate
      }

      const message = this.postBotMessage(
        params.topicId,
        isFirstOpen
          ? "【運営Bot】\n 発表が始まりました！\nコメントを投稿して盛り上げましょう 🎉🎉\n"
          : "【運営Bot】\n 発表が再開されました",
      )
      messages.push(message)
      // トピック開始のBotメッセージ
      return {
        messages,
        activeTopic: this.activeTopic,
      }
    }

    if (params.type === "PAUSE") {
      targetTopic.state = "paused"
      this.topicTimeData[targetTopic.id].pausedDate = new Date().getTime()

      const botMessage = this.postBotMessage(
        params.topicId,
        "【運営Bot】\n 発表が中断されました",
      )
      return {
        messages: [botMessage],
        activeTopic: this.activeTopic,
      }
    }

    if (params.type === "CLOSE") {
      targetTopic.state = "finished"

      const botMessage = this.finishTopic(params.topicId)
      return { messages: [botMessage], activeTopic: this.activeTopic }
    }

    throw new Error(
      `[sushi-chat-server] params.type(${params.type}) is invalid.`,
    )
  }

  /**
   * トピック終了時の処理を行う
   * @param topicId 終了させるトピックID
   */
  private finishTopic = (topicId: string): MessageClass => {
    // 質問の集計
    const questions = this.chatItems.filter<QuestionStore>(
      (chatItemStore): chatItemStore is QuestionStore =>
        chatItemStore.type === "question" && chatItemStore.topicId === topicId,
    )
    // 回答済みの質問の集計
    const answeredIds = this.chatItems
      .filter<AnswerStore>(
        (chatItemStore): chatItemStore is AnswerStore =>
          chatItemStore.type === "answer" && chatItemStore.topicId === topicId,
      )
      .map(({ target }) => target)

    const questionMessages = questions.map(
      ({ id, content }) =>
        `Q. ${content}` + (answeredIds.includes(id) ? " [回答済]" : ""),
    )

    // トピック終了のBotメッセージ
    return this.postBotMessage(
      topicId,
      [
        "【運営Bot】\n 発表が終了しました！\n（引き続きコメントを投稿いただけます）",
        questionMessages.length > 0 ? "" : null,
        ...questionMessages,
      ]
        .filter(Boolean)
        .join("\n"),
    )
  }

  /**
   * 新しくスタンプが投稿された時に呼ばれる関数。
   * @param stamp
   */
  public postStamp = (stamp: StampClass) => {
    if (!this.isOpened) {
      throw new Error("[sushi-chat-server] Room is not opened.")
    }
    // ユーザーの存在チェック
    if (!this.userIdExistCheck(stamp.userId)) {
      throw new Error("[sushi-chat-server] User does not exists.")
    }
    this.stamps.push(stamp)
  }

  /**
   * 新しくチャットが投稿された時に呼ばれる関数。
   * @param userId
   * @param chatItem
   */
  public postChatItem = (userId: string, chatItem: ChatItemClass) => {
    if (!this.isOpened) {
      throw new Error("[sushi-chat-server] Room is not opened.")
    }
    // TODO: not-startedなルームには投稿できない
    // ユーザーの存在チェック
    if (!this.userIdExistCheck(userId)) {
      throw new Error("[sushi-chat-server] User does not exists.")
    }
    // 保存する形式に変換
    const chatItemStore = chatItem.toChatItemStore()
    // 配列に保存
    this.chatItems.push(chatItemStore)
  }

  /**
   * フロントに返すチャットアイテムを整形する関数
   * 具体的にはリプライ先のChatItemなどで、IDのみ保存されている部分をChatItemに置き換えて返す
   *
   * @param chatItemStore
   * @returns フロントに返すためのデータ
   */
  private chatItemStoreToChatItem = (
    chatItemStore: ChatItemStore,
  ): ChatItem => {
    if (chatItemStore.type === "message") {
      if (chatItemStore.target == null) {
        // 通常メッセージ
        return {
          ...chatItemStore,
          target: null,
        }
      } else {
        // リプライメッセージ
        // リプライ先のメッセージを取得する
        const targetChatItemStore = this.chatItems.find(
          ({ id, type }) =>
            id === chatItemStore.target &&
            (type === "answer" || type === "message"),
        )
        if (targetChatItemStore == null) {
          throw new Error(
            "[sushi-chat-server] Reply target message does not exists.",
          )
        }
        return {
          ...chatItemStore,
          target: this.chatItemStoreToChatItem(targetChatItemStore) as
            | Answer
            | Message,
        }
      }
    } else if (chatItemStore.type === "reaction") {
      // リアクション
      const targetChatItemStore = this.chatItems.find(
        ({ id, type }) =>
          id === chatItemStore.target &&
          (type === "message" || type === "question" || type === "answer"),
      )
      if (targetChatItemStore == null) {
        throw new Error(
          "[sushi-chat-server] Reaction target message does not exists.",
        )
      }
      return {
        ...chatItemStore,
        target: this.chatItemStoreToChatItem(targetChatItemStore) as
          | Message
          | Answer
          | Question,
      }
    } else if (chatItemStore.type === "question") {
      // 質問
      return chatItemStore
    } else {
      // 回答
      const targetChatItemStore = this.chatItems.find(
        ({ id, type }) => id === chatItemStore.target && type === "question",
      )
      if (targetChatItemStore == null) {
        throw new Error(
          "[sushi-chat-server] Answer target message does not exists.",
        )
      }
      return {
        ...chatItemStore,
        target: this.chatItemStoreToChatItem(targetChatItemStore) as Question,
      }
    }
  }

  // Botメッセージ
  private postBotMessage = (topicId: string, content: string): MessageClass => {
    const botMessage = new MessageClass(
      uuid(),
      topicId,
      this.id,
      UserClass.ADMIN_ICON_ID,
      new Date(),
      content,
      null,
      this.calcTimestamp(topicId),
    )
    this.chatItems.push(botMessage.toChatItemStore())

    return botMessage
  }

  // utils

  private userIdExistCheck = (userId: string) => {
    return this.users.find(({ id }) => id === userId) != null
  }

  private get activeTopic() {
    return this.topics.find(({ state }) => state === "active") ?? null
  }

  private getTopicById = (topicId: string) => {
    return this.topics.find((topic) => topic.id === topicId)
  }

  private findOpenedDateOrThrow(topicId: string): number {
    const openedDate = this.topicTimeData[topicId].openedDate
    if (openedDate === null) {
      throw new Error(`openedDate of topicId(id: ${topicId}) is null.`)
    }
    return openedDate
  }
}

export default RoomClass
