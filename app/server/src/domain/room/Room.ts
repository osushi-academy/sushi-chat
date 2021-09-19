import { v4 as uuid } from "uuid"
import ChatItem from "../chatItem/ChatItem"
import Stamp from "../stamp/Stamp"
import Message from "../chatItem/Message"
import Topic, { TopicTimeData } from "./Topic"
import Question from "../chatItem/Question"
import Answer from "../chatItem/Answer"
import Admin from "../admin/admin"
import { RoomState, TopicState } from "sushi-chat-shared"

class RoomClass {
  private readonly _topics: Topic[]
  private _topicTimeData: Record<number, TopicTimeData> = {}

  constructor(
    public readonly id: string,
    public readonly title: string,
    public readonly inviteKey: string,
    topics: (Omit<Topic, "id" | "state" | "pinnedChatItemId"> &
      Partial<Pick<Topic, "id" | "state" | "pinnedChatItemId">>)[],
    public readonly description = "",
    topicTimeData: Record<number, TopicTimeData> = {},
    public _startAt: Date | null = null,
    public _finishAt: Date | null = null,
    public _archivedAt: Date | null = null,
    private userIds = new Set<string>([]),
    private _chatItems: ChatItem[] = [],
    private _stamps: Stamp[] = [],
    private _state: RoomState = "not-started",
  ) {
    this._topics = topics.map((topic, i) => ({
      ...topic,
      id: topic.id ?? i + 1,
      state: topic.state ?? "not-started",
      pinnedChatItemId: topic.pinnedChatItemId,
    }))
    this._topics.forEach(({ id }) => {
      this._topicTimeData[id] = topicTimeData[id] ?? {
        openedDate: null,
        pausedDate: null,
        offsetTime: 0,
      }
    })
  }

  public get topics(): Topic[] {
    return [...this._topics]
  }

  public get topicTimeData(): Record<string, TopicTimeData> {
    const timeData: Record<string, TopicTimeData> = {}
    for (const [id, data] of Object.entries(this._topicTimeData)) {
      timeData[id] = { ...data }
    }
    return timeData
  }

  public get activeUserCount(): number {
    return this.userIds.size
  }

  public get chatItems() {
    return [...this._chatItems]
  }

  public get stamps() {
    return [...this._stamps]
  }

  public get state(): RoomState {
    return this._state
  }

  public get startAt(): Date | null {
    return this._startAt
  }

  public get finishAt(): Date | null {
    return this._finishAt
  }

  public get archivedAt(): Date | null {
    return this._archivedAt
  }

  public calcTimestamp = (topicId: number): number => {
    const openedDate = this.findOpenedDateOrThrow(topicId)
    const offsetTime = this._topicTimeData[topicId].offsetTime
    const timestamp = new Date().getTime() - openedDate - offsetTime

    return Math.max(timestamp, 0)
  }

  /**
   * ルームを開始する
   */
  public startRoom = () => {
    this.assertRoomIsNotStarted()
    this._state = "ongoing"
  }

  /**
   * ルームを終了する
   */
  public finishRoom = () => {
    this.assertRoomIsOngoing()
    this._state = "finished"
  }

  /**
   * ルームを閉じる
   */
  public archiveRoom = () => {
    this.assertRoomIsFinished()
    this._state = "archived"
  }

  /**
   * ユーザーをルームに参加させる
   * @param userId 参加させるユーザーのID
   * @returns number アクティブなユーザー数
   */
  public joinUser = (userId: string): number => {
    this.userIds.add(userId)
    return this.activeUserCount
  }

  /**
   * ユーザーをルームから退室させる
   * @param userId 退室させるユーザーのID
   * @returns number アクティブなユーザー数
   */
  public leaveUser = (userId: string): number => {
    this.assertUserExists(userId)
    this.userIds.delete(userId)
    return this.activeUserCount
  }

  /**
   * トピックの状態を変更する
   * @param topicId 状態が更新されるトピックのID
   * @param state 変更後のトピックの状態
   */
  public changeTopicState = (topicId: number, state: TopicState): Message[] => {
    this.assertRoomIsOngoing()

    const targetTopic = this.findTopicOrThrow(topicId)

    switch (state) {
      case "ongoing": {
        const messages: Message[] = []

        // 現在のactiveトピックをfinishedにする
        const currentActiveTopic = this.activeTopic
        if (currentActiveTopic !== null) {
          const message = this.finishTopic(currentActiveTopic)
          messages.push(message)
        }

        const message = this.startTopic(targetTopic)
        messages.push(message)

        return messages
      }

      case "paused": {
        const botMessage = this.pauseTopic(targetTopic)
        return [botMessage]
      }

      case "finished": {
        const botMessage = this.finishTopic(targetTopic)
        return [botMessage]
      }

      default: {
        throw new Error(`Topic state(${state}) is invalid.`)
      }
    }
  }

  /**
   * トピックを開始する
   * @param topic 開始されるトピック
   * @returns MessageClass 運営botメッセージ
   */
  private startTopic(topic: Topic): Message {
    topic.state = "ongoing"

    const timeData = this._topicTimeData[topic.id]
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
   * @returns MessageClass 運営botメッセージ
   */
  private pauseTopic(topic: Topic): Message {
    topic.state = "paused"

    this._topicTimeData[topic.id].pausedDate = new Date().getTime()

    return this.postBotMessage(topic.id, "【運営Bot】\n 発表が中断されました")
  }

  /**
   * トピック終了時の処理を行う
   * @param topic 終了させるトピック
   * @returns MessageClass 運営botメッセージ
   */
  private finishTopic = (topic: Topic): Message => {
    topic.state = "finished"

    // 質問の集計
    const questions = this._chatItems.filter<Question>(
      (c): c is Question => c instanceof Question && c.topicId === topic.id,
    )
    // 回答済みの質問の集計
    const answeredIds = this._chatItems
      .filter<Answer>(
        (c): c is Answer => c instanceof Answer && c.topicId === topic.id,
      )
      .map(({ id }) => id)

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
   * スタンプの投稿
   * @param stamp 投稿されたstamp
   */
  public postStamp = (stamp: Stamp) => {
    this.assertRoomIsOngoing()
    this.assertUserExists(stamp.userId)

    this._stamps.push(stamp)
  }

  /**
   * チャットの投稿
   * @param userId
   * @param chatItem
   */
  public postChatItem = (userId: string, chatItem: ChatItem) => {
    this.assertRoomIsOngoing()
    this.assertUserExists(userId)

    this._chatItems.push(chatItem)
  }

  private postBotMessage = (topicId: number, content: string): Message => {
    const botMessage = new Message(
      uuid(),
      this.id,
      topicId,
      Admin.ICON_ID,
      "admin",
      content,
      null,
      new Date(),
      this.calcTimestamp(topicId),
    )
    this._chatItems.push(botMessage)

    return botMessage
  }

  private get activeTopic(): Topic | null {
    return this._topics.find(({ state }) => state === "ongoing") ?? null
  }

  private findTopicOrThrow(topicId: number) {
    const topic = this._topics.find((topic) => topic.id === topicId)
    if (!topic) {
      throw new Error(`Topic(id:${topicId}) was not found.`)
    }
    return topic
  }

  private findOpenedDateOrThrow(topicId: number): number {
    const openedDate = this._topicTimeData[topicId].openedDate
    if (openedDate === null) {
      throw new Error(`openedDate of topicId(id: ${topicId}) is null.`)
    }
    return openedDate
  }

  private findChatItemOrThrow(chatItemId: string) {
    const chatItem = this._chatItems.find((c) => c.id === chatItemId)
    if (!chatItem) {
      throw new Error(`ChatItem(id:${chatItemId}) was not found.`)
    }
    return chatItem
  }
  private assertRoomIsOngoing() {
    if (this._state != "ongoing") {
      throw new Error(`Room(id: ${this.id}) is not ongoing.`)
    }
  }

  private assertRoomIsNotStarted() {
    if (this._state != "not-started") {
      throw new Error(
        `[sushi-chat-server] Room(id: ${this.id}) has already started.`,
      )
    }
  }

  private assertRoomIsFinished() {
    if (this._state != "finished") {
      throw new Error(`Room(id: ${this.id}) is not finished.`)
    }
  }

  private assertUserExists(userId: string) {
    const exists = this.userIds.has(userId)
    if (!exists) {
      throw new Error(
        `[sushi-chat-server] User(id: ${userId}) does not exists.`,
      )
    }
  }
}

export default RoomClass
