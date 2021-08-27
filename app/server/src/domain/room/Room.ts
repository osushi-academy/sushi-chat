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
  private readonly _topics: Topic[]
  private users: User[] = []
  private chatItems: ChatItemStore[] = []
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

  public get topics(): Topic[] {
    return [...this._topics]
  }

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
    this._topics = topics.map((topic, i) => ({
      ...topic,
      id: `${i + 1}`,
      state: "not-started",
    }))
    this._topics.forEach(({ id }) => {
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
    this.assertRoomIsNotOpen()
    this.isOpened = true
  }

  public finishRoom = () => {
    this.assertRoomIsOpen()
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
    const leftUser = this.findUserOrThrow(userId)
    this.users = this.users.filter((user) => user.id !== leftUser.id)

    return this.activeUserCount
  }

  /**
   * トピックの状態を変更するときに呼ばれる関数
   */
  public changeTopicState = (
    params: AdminChangeTopicStateParams,
  ): { messages: MessageClass[]; activeTopic: Topic | null } => {
    this.assertRoomIsOpen()

    const targetTopic = this.findTopicOrThrow(params.topicId)

    if (params.type === "OPEN") {
      const messages: MessageClass[] = []

      // 現在のactiveトピックをfinishedにする
      const currentActiveTopic = this.activeTopic
      if (currentActiveTopic !== null) {
        const message = this.finishTopic(currentActiveTopic)
        messages.push(message)
      }

      const message = this.startTopic(targetTopic)
      messages.push(message)

      return {
        messages,
        activeTopic: this.activeTopic,
      }
    }

    if (params.type === "PAUSE") {
      const messages = [this.pauseTopic(targetTopic)]
      return { messages, activeTopic: this.activeTopic }
    }

    if (params.type === "CLOSE") {
      const botMessage = this.finishTopic(targetTopic)
      return { messages: [botMessage], activeTopic: this.activeTopic }
    }

    throw new Error(
      `[sushi-chat-server] params.type(${params.type}) is invalid.`,
    )
  }

  /**
   * トピックを開始する
   * @param topic 開始されるトピック
   */
  private startTopic(topic: Topic): MessageClass {
    topic.state = "active"

    const timeData = this.topicTimeData[topic.id]
    const isFirstOpen = timeData.openedDate === null

    // 初めてOpenされたトピックならopenedDateをセット
    if (isFirstOpen) {
      timeData.openedDate = new Date().getTime()
    }
    //pauseされていた時間をoffsetTimeに追加
    const pausedDate = timeData.pausedDate
    if (pausedDate !== null) {
      timeData.offsetTime += new Date().getTime() - pausedDate
    }

    const message =
      "【運営Bot】\n " +
      (isFirstOpen
        ? "発表が始まりました！\nコメントを投稿して盛り上げましょう 🎉🎉\n"
        : "発表が再開されました")

    return this.postBotMessage(topic.id, message)
  }

  /**
   * トピックを中断する
   * @param topic 中断されるトピック
   */
  private pauseTopic(topic: Topic): MessageClass {
    topic.state = "paused"

    this.topicTimeData[topic.id].pausedDate = new Date().getTime()

    return this.postBotMessage(topic.id, "【運営Bot】\n 発表が中断されました")
  }

  /**
   * トピック終了時の処理を行う
   * @param topic 終了させるトピック
   */
  private finishTopic = (topic: Topic): MessageClass => {
    topic.state = "finished"

    // 質問の集計
    const questions = this.chatItems.filter<QuestionStore>(
      (chatItemStore): chatItemStore is QuestionStore =>
        chatItemStore.type === "question" && chatItemStore.topicId === topic.id,
    )
    // 回答済みの質問の集計
    const answeredIds = this.chatItems
      .filter<AnswerStore>(
        (chatItemStore): chatItemStore is AnswerStore =>
          chatItemStore.type === "answer" && chatItemStore.topicId === topic.id,
      )
      .map(({ target }) => target)

    const questionMessages = questions.map(
      ({ id, content }) =>
        `Q. ${content}` + (answeredIds.includes(id) ? " [回答済]" : ""),
    )

    // トピック終了のBotメッセージ
    return this.postBotMessage(
      topic.id,
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
    this.assertRoomIsOpen()
    this.assertUserExists(stamp.userId)

    this.stamps.push(stamp)
  }

  /**
   * 新しくチャットが投稿された時に呼ばれる関数。
   * @param userId
   * @param chatItem
   */
  public postChatItem = (userId: string, chatItem: ChatItemClass) => {
    this.assertRoomIsOpen()
    this.assertUserExists(userId)

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

  private get activeTopic(): Topic | null {
    return this._topics.find(({ state }) => state === "active") ?? null
  }

  private getTopicById = (topicId: string) => {
    return this._topics.find((topic) => topic.id === topicId)
  }

  private findTopicOrThrow(topicId: string) {
    const topic = this.getTopicById(topicId)
    if (topic === undefined) {
      throw new Error(
        `[sushi-chat-server] Topic(id: ${topicId}) does not exists.`,
      )
    }
    return topic
  }

  private findUserOrThrow(userId: string): User {
    const user = this.users.find((user) => user.id === userId)
    if (user === undefined) {
      throw new Error(
        `[sushi-chat-server] User(id: ${userId}) does not exists.`,
      )
    }
    return user
  }

  private findOpenedDateOrThrow(topicId: string): number {
    const openedDate = this.topicTimeData[topicId].openedDate
    if (openedDate === null) {
      throw new Error(`openedDate of topicId(id: ${topicId}) is null.`)
    }
    return openedDate
  }

  private assertRoomIsOpen() {
    if (!this.isOpened) {
      throw new Error(`Room(id: ${this.id}) is not opened.`)
    }
  }

  private assertRoomIsNotOpen() {
    if (this.isOpened) {
      throw new Error(
        `[sushi-chat-server] Room(id: ${this.id}) has already opened.`,
      )
    }
  }

  private assertUserExists(userId: string) {
    const exists = this.users.find(({ id }) => id === userId) !== null
    if (!exists) {
      throw new Error(
        `[sushi-chat-server] User(id: ${userId}) does not exists.`,
      )
    }
  }
}

export default RoomClass
