import ChatItem from "../chatItem/ChatItem"
import Stamp from "../stamp/Stamp"
import Topic, { TopicTimeData } from "./Topic"
import { RoomState, TopicState } from "sushi-chat-shared"
import { PartiallyPartial } from "../../types/utils"
import SystemUser from "../user/SystemUser"
import UserFactory from "../../infra/factory/UserFactory"
import Reaction from "../chatItem/Reaction"
import Question from "../chatItem/Question"
import Answer from "../chatItem/Answer"
import Message from "../chatItem/Message"
import { v4 as uuid } from "uuid"
import {
  ArgumentError,
  NotAuthorizedError,
  NotFoundError,
  StateError,
} from "../../error"

class RoomClass {
  private readonly _topics: Topic[]
  private _topicTimeData: Record<number, TopicTimeData> = {}

  constructor(
    public readonly id: string,
    public readonly title: string,
    public readonly adminInviteKey: string,
    public readonly description: string,
    topics: PartiallyPartial<Topic, "id" | "state" | "pinnedChatItemId">[],
    public readonly adminIds: Set<string>,
    private _state: RoomState = "not-started",
    private _startAt: Date | null = null,
    topicTimeData: Record<number, TopicTimeData> = {},
    private _finishAt: Date | null = null,
    private _archivedAt: Date | null = null,
    private userIds = new Set<string>([]),
    private _chatItems: ChatItem[] = [],
    private _stamps: Stamp[] = [],
    public readonly systemUser: SystemUser = new UserFactory().createSystemUser(
      id,
    ),
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
    userIds.add(systemUser.id)
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

  private get activeUserCount(): number {
    return this.userIds.size
  }

  public get chatItems() {
    return [...this._chatItems]
  }

  public get stamps(): Stamp[] {
    return [...this._stamps]
  }

  public get pinnedChatItemIds(): (string | null)[] {
    return this.topics.map((t) => t.pinnedChatItemId ?? null)
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

  public calcTimestamp = (topicId: number): number | null => {
    const topic = this.findTopicOrThrow(topicId)
    if (topic.state === "not-started") {
      throw new ArgumentError(`Topic(id:${topicId}) was not started.`)
    }

    // 停止中・終了後のトピックの場合はタイムスタンプをnullとする
    if (topic.state !== "ongoing") {
      return null
    }

    const openedDate = this._topicTimeData[topicId].openedDate
    if (openedDate === null) {
      throw new StateError(`OpenedDate of ongoing Topic(${topicId}) is null.`)
    }
    const offsetTime = this._topicTimeData[topicId].offsetTime
    const timestamp = new Date().getTime() - openedDate - offsetTime

    return Math.max(timestamp, 0)
  }

  /**
   * ルームを開始する
   * @param adminId adminのID
   */
  public startRoom = (adminId: string) => {
    this.assertIsAdmin(adminId)
    this.assertRoomIsNotStarted()

    this._state = "ongoing"
    this._startAt = new Date()
  }

  /**
   * ルームを終了する
   */
  public finishRoom = () => {
    this.assertRoomIsOngoing()

    this._state = "finished"
    this._finishAt = new Date()
  }

  /**
   * ルームを閉じる
   * @param adminId adminのID
   */
  public archiveRoom = (adminId: string) => {
    this.assertIsAdmin(adminId)
    this.assertRoomIsFinished()

    this._state = "archived"
    this._archivedAt = new Date()
  }

  /**
   * ユーザーをルームに参加させる
   * @param userId 参加させるユーザーのID
   * @returns number アクティブなユーザー数
   */
  public joinUser = (userId: string): number => {
    this.assertRoomIsOngoing()

    this.userIds.add(userId)

    return this.activeUserCount
  }

  /**
   * 管理者であることを確認してルームに参加させる
   * @param userId 参加させるユーザーのID
   * @param adminId 参加させるユーザーの管理者ID
   * @returns number アクティブなユーザー数
   */
  public joinAdminUser = (userId: string, adminId: string): number => {
    this.assertRoomIsOngoing()
    this.assertIsAdmin(adminId)

    this.userIds.add(userId)

    return this.activeUserCount
  }

  /**
   * ユーザーをルームから退室させる
   * @param userId 退室させるユーザーのID
   * @returns number ユーザーを退室させた後のアクティブユーザー数
   */
  public leaveUser = (userId: string): number => {
    this.userIds.delete(userId)
    return this.activeUserCount
  }

  /**
   * 管理者をルームに招待する
   * @param adminId 管理者にするadminのID
   * @param adminInviteKey 送られてきた招待キー
   */
  public inviteAdmin = (adminId: string, adminInviteKey: string): void => {
    const result = this.validateAdminInviteKey(adminInviteKey)
    if (!result) {
      throw new ArgumentError(`AdminInviteKey(${adminInviteKey}) is invalid.`)
    }

    this.adminIds.add(adminId)
  }

  /**
   * ルームの管理者かどうかを確認する
   * @param adminId 確認したいadminのID
   */
  public isAdmin = (adminId: string): boolean => {
    return this.adminIds.has(adminId)
  }

  /**
   * トピックの状態を変更する
   * admin(Roomに参加している)のみ実行可能
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
        throw new ArgumentError(`Topic state(${state}) is invalid.`)
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
    this._topicTimeData[topic.id].pausedDate = new Date().getTime()

    const message = this.postBotMessage(
      topic.id,
      "【運営Bot】\n 発表が中断されました",
    )

    // NOTE: stateの更新前に、botmessageのタイムスタンプを計算しておく必要がある
    topic.state = "paused"

    return message
  }

  /**
   * トピック終了時の処理を行う
   * @param topic 終了させるトピック
   * @returns MessageClass 運営botメッセージ
   */
  private finishTopic = (topic: Topic): Message => {
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
    const message = this.postBotMessage(
      topic.id,
      [
        "【運営Bot】\n 発表が終了しました！\n（引き続きコメントを投稿いただけます）",
        questionMessages.length > 0 ? "" : null,
        ...questionMessages,
      ]
        .filter(Boolean)
        .join("\n"),
    )

    // NOTE: stateの更新前に、botmessageのタイムスタンプを計算しておく必要がある
    topic.state = "finished"

    return message
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

    // NOTE: 同じユーザーが、同じchatItemに対し、複数回リアクションすることはできない
    if (
      chatItem instanceof Reaction &&
      this.chatItems
        .filter(
          (chatItem): chatItem is Reaction => chatItem instanceof Reaction,
        )
        .some(
          ({ topicId, user, quote }) =>
            topicId === chatItem.topicId &&
            user.id === chatItem.user.id &&
            quote.id === chatItem.quote.id,
        )
    ) {
      throw new ArgumentError(
        `Reaction(topicId: ${chatItem.topicId}, user.id: ${chatItem.user.id}, quote.id: ${chatItem.quote.id}) has already exists.`,
      )
    }

    this._chatItems.push(chatItem)
  }

  private postBotMessage = (topicId: number, content: string): Message => {
    const botMessage = new Message(
      uuid(),
      topicId,
      this.systemUser,
      "system",
      content,
      null,
      new Date(),
      this.calcTimestamp(topicId) ?? undefined,
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
      throw new NotFoundError(`Topic(${topicId}) was not found.`)
    }
    return topic
  }

  private assertRoomIsOngoing() {
    if (this._state !== "ongoing") {
      throw new StateError(`Room(${this.id}) is not ongoing.`)
    }
  }

  private assertRoomIsNotStarted() {
    if (this._state !== "not-started") {
      throw new StateError(`Room(${this.id}) has already started.`)
    }
  }

  private assertRoomIsFinished() {
    if (this._state !== "finished") {
      throw new StateError(`Room(${this.id}) is not finished.`)
    }
  }

  private assertUserExists(userId: string) {
    const exist = this.userIds.has(userId)
    if (!exist) {
      throw new NotFoundError(`User(${userId}) not exist.`)
    }
  }

  private validateAdminInviteKey(adminInviteKey: string) {
    // TODO: ハッシュ化して保存しておいて、受け取った値をハッシュ化して比較すべき
    return this.adminInviteKey === adminInviteKey
  }

  private assertIsAdmin(userId: string) {
    const isAdmin = this.adminIds.has(userId)
    if (!isAdmin) {
      throw new NotAuthorizedError(
        `User(${userId}) is not admin of room(${this.id}).`,
      )
    }
  }
}

export default RoomClass
