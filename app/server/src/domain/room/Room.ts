import ChatItem from "../chatItem/ChatItem"
import Stamp from "../stamp/Stamp"
import Topic, { TopicTimeData } from "./Topic"
import { RoomState, TopicState } from "sushi-chat-shared"
import { PartiallyPartial } from "../../types/utils"
import SystemUser from "../user/SystemUser"
import UserFactory from "../../infra/factory/UserFactory"
import Reaction from "../chatItem/Reaction"

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

  public calcTimestamp = (topicId: number): number => {
    const openedDate = this.findOpenedDateOrThrow(topicId)
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
   * @returns number アクティブなユーザー数
   */
  public leaveUser = (userId: string): number => {
    this.assertUserExists(userId)
    this.userIds.delete(userId)

    return this.activeUserCount
  }

  /**
   * 管理者をルームに招待する
   * @param adminId 管理者にするadminのID
   * @param adminInviteKey 送られてきた招待キー
   */
  public inviteAdmin = (adminId: string, adminInviteKey: string): void => {
    this.assertSameAdminInviteKey(adminInviteKey)
    this.adminIds.add(adminId)
  }

  /**
   * ルームの管理者かどうかを確認する
   * @param adminId 確認したいadminのID
   */
  public isAdmin = (adminId: string): boolean => {
    const isAdmin = this.adminIds.has(adminId)
    return isAdmin
  }

  /**
   * トピックの状態を変更する
   * @param topicId 状態が更新されるトピックのID
   * @param state 変更後のトピックの状態
   * @returns 変更があったトピックのidと変更前後のstate
   */
  public changeTopicState = (
    topicId: number,
    state: TopicState,
  ): { id: number; oldState: TopicState; newState: TopicState }[] => {
    this.assertRoomIsOngoing()

    const targetTopic = this.findTopicOrThrow(topicId)
    const targetTopicOldState = targetTopic.state

    switch (state) {
      case "ongoing": {
        const changedTopics: {
          id: number
          oldState: TopicState
          newState: TopicState
        }[] = []

        // 現在のactiveトピックをfinishedにする
        const currentActiveTopic = this.activeTopic
        if (currentActiveTopic !== null) {
          const oldState = currentActiveTopic.state
          this.finishTopic(currentActiveTopic)
          changedTopics.push({
            id: currentActiveTopic.id,
            oldState,
            newState: "finished",
          })
        }

        // const message = this.startTopic(targetTopic)
        this.startTopic(targetTopic)
        changedTopics.push({
          id: targetTopic.id,
          oldState: targetTopicOldState,
          newState: "ongoing",
        })

        return changedTopics
      }

      case "paused": {
        // const botMessage = this.pauseTopic(targetTopic)
        this.pauseTopic(targetTopic)
        return [
          {
            id: targetTopic.id,
            oldState: targetTopicOldState,
            newState: "paused",
          },
        ]
      }

      case "finished": {
        // const botMessage = this.finishTopic(targetTopic)
        const newTopic = this.finishTopic(targetTopic)
        return [
          {
            id: targetTopic.id,
            oldState: targetTopicOldState,
            newState: "finished",
          },
        ]
      }

      default: {
        throw new Error(`Topic state(${state}) is invalid.`)
      }
    }
  }

  /**
   * トピックを開始する
   * @param topic 開始されるトピック
   */
  private startTopic(topic: Topic) {
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
  }

  /**
   * トピックを中断する
   * @param topic 中断されるトピック
   */
  private pauseTopic(topic: Topic) {
    topic.state = "paused"
    this._topicTimeData[topic.id].pausedDate = new Date().getTime()
  }

  /**
   * トピック終了時の処理を行う
   * @param topic 終了させるトピック
   */
  private finishTopic = (topic: Topic) => {
    topic.state = "finished"
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

    console.log(this.chatItems)

    if (
      chatItem instanceof Reaction &&
      this.chatItems
        .filter(
          (chatItem): chatItem is Reaction => chatItem instanceof Reaction,
        )
        .find(
          ({ topicId, user, quote }) =>
            topicId === chatItem.topicId &&
            user.id === chatItem.user.id &&
            quote.id === chatItem.quote.id,
        ) != null
    ) {
      throw new Error(
        `Reaction(topicId: ${chatItem.topicId}, user.id: ${chatItem.user.id}, quote.id: ${chatItem.quote.id}) has already exists.`,
      )
    }

    this._chatItems.push(chatItem)
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

  private assertRoomIsOngoing() {
    if (this._state != "ongoing") {
      throw new Error(`Room(id: ${this.id}) is not ongoing.`)
    }
  }

  private assertRoomIsNotStarted() {
    if (this._state != "not-started") {
      // TODO: エラーの種別を捕捉できる仕組みが必要。カスタムのエラーを定義する。
      //  → 例：複数管理者がほぼ同時にルーム開始/終了をリクエストした場合、2番手のエラーはserviceかcontrollerでエラーの
      //         種別を捕捉できた方が良さそう
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

  private assertSameAdminInviteKey(adminInviteKey: string) {
    const same = this.adminInviteKey === adminInviteKey
    if (!same) {
      throw new Error(
        `[sushi-chat-server] adminInviteKey(${adminInviteKey}) does not matches.`,
      )
    }
  }

  private assertIsAdmin(adminId: string) {
    const isAdmin = this.adminIds.has(adminId)
    if (!isAdmin) {
      throw new Error(
        `Admin(id:${adminId}) is not admin of this room(id:${this.id}).`,
      )
    }
  }
}

export default RoomClass
