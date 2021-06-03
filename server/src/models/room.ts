import { Server } from "socket.io";
import {
  Answer,
  AnswerStore,
  ChatItem,
  ChatItemStore,
  Message,
  MessageStore,
  Question,
  QuestionStore,
  User,
} from "../chatItem";
import {
  AdminChangeTopicStateParams,
  PostChatItemParams,
  PostStampParams,
} from "../events";
import SaveChatItemClass from "../saveChatItem";
import { IServerSocket } from "../serverSocket";
import { Stamp, stampIntervalSender } from "../stamp";
import { Topic, TopicState } from "../topic";
import { v4 as getUUID } from "uuid";

type StampStore = Stamp & {
  createdAt: Date;
};

class RoomClass {
  public static globalSocket: Server;

  private users: (User & { socket: IServerSocket })[] = [];
  private chatItems: ChatItemStore[] = [];
  public topics: (Topic & { state: TopicState })[];
  public stamps: StampStore[] = [];
  public stampsQueue: Stamp[] = [];
  private isOpened = false;
  private stampIntervalSenderTimer: NodeJS.Timeout | null = null;

  /**
   * @var {number} topicTimeData.openedDate トピックの開始時刻
   * @var {number} topicTimeData.pausedDate トピックが最後に一時停止された時刻
   * @var {number} topicTimeData.offsetTime トピックが一時停止されていた総時間
   */
  private topicTimeData: Record<
    string,
    { openedDate: number | null; pausedDate: number | null; offsetTime: number }
  > = {};

  public get activeUserCount(): number {
    return this.users.length;
  }

  public getChatItems = () => this.chatItems.map(this.chatItemStoreToChatItem);

  constructor(
    public readonly id: string,
    public readonly title: string,
    topics: Omit<Topic, "id">[]
  ) {
    this.topics = topics.map((topic, i) => ({
      ...topic,
      id: `${i + 1}`,
      state: "not-started",
    }));
    this.topics.forEach(({ id }) => {
      this.topicTimeData[id] = {
        openedDate: null,
        pausedDate: null,
        offsetTime: 0,
      };
    });
  }

  /**
   * ルームを開始する
   */
  public startRoom = () => {
    if (this.isOpened) {
      throw new Error("[sushi-chat-server] Room has already opened.");
    }
    this.isOpened = true;
    RoomClass.globalSocket.to(this.id).emit("PUB_START_ROOM", {});
  };

  public finishRoom = () => {
    this.isOpened = false;
    RoomClass.globalSocket.to(this.id).emit("PUB_FINISH_ROOM", {});
  };

  public closeRoom = () => {
    this.isOpened = false;
    RoomClass.globalSocket.to(this.id).emit("PUB_CLOSE_ROOM", {});
  };

  /**
   * ユーザーがルームに参加した場合に呼ばれる関数
   * @param socket
   * @param iconId
   * @returns
   */
  public joinUser = (socket: IServerSocket, iconId: string) => {
    this.users.push({ id: socket.id, iconId, socket });
    socket.broadcast("PUB_ENTER_ROOM", {
      iconId,
      activeUserCount: this.users.length,
    });
  };

  /**
   * ユーザーがルームから退室した場合に呼ばれる関数
   * @param userId
   */
  public leaveUser = (userId: string) => {
    const leavedUser = this.users.find((user) => user.id !== userId);
    if (leavedUser == null) {
      throw new Error("[sushi-chat-server] User does not exists.");
    }
    this.users = this.users.filter((user) => user.id !== leavedUser.id);
    RoomClass.globalSocket.to(this.id).emit("PUB_LEAVE_ROOM", {
      iconId: leavedUser.iconId,
      activeUserCount: this.users.length,
    });
  };

  /**
   * トピックの状態を変更するときに呼ばれる関数
   */
  public changeTopicState = (params: AdminChangeTopicStateParams) => {
    if (!this.isOpened) {
      throw new Error("[sushi-chat-server] Room is not opened.");
    }
    const targetTopic = this.getTopicById(params.topicId);
    if (targetTopic == null) {
      throw new Error("[sushi-chat-server] Topic does not exists.");
    }
    if (params.type === "OPEN") {
      // 現在activeであるトピックをfinishedする
      const currentActiveTopic = this.activeTopic;
      if (currentActiveTopic != null) {
        currentActiveTopic.state = "finished";
        this.finishTopic(currentActiveTopic.id);
      }

      // 指定されたトピックをOpenにする
      targetTopic.state = "active";

      const isFirstOpen = this.topicTimeData[targetTopic.id].openedDate == null;

      // タイムスタンプの計算
      if (isFirstOpen) {
        this.topicTimeData[targetTopic.id].openedDate = new Date().getTime();
      }
      const pausedDate = this.topicTimeData[targetTopic.id].pausedDate;
      if (pausedDate != null) {
        this.topicTimeData[targetTopic.id].offsetTime +=
          new Date().getTime() - pausedDate;
      }

      // トピック開始のBotメッセージ
      this.sendBotMessage(
        params.topicId,
        isFirstOpen
          ? "【運営Bot】\n 発表が始まりました！\nコメントを投稿して盛り上げましょう 🎉🎉\n"
          : "【運営Bot】\n 発表が再開されました"
      );
    } else if (params.type === "PAUSE") {
      targetTopic.state = "paused";
      this.topicTimeData[targetTopic.id].pausedDate = new Date().getTime();
      this.sendBotMessage(params.topicId, "【運営Bot】\n 発表が中断されました");
    } else if (params.type === "CLOSE") {
      targetTopic.state = "finished";
      this.finishTopic(params.topicId);
    } else {
      throw new Error("[sushi-chat-server] Type is invalid.");
    }
    // stateの変更を送信する
    RoomClass.globalSocket.to(this.id).emit("PUB_CHANGE_TOPIC_STATE", {
      type: params.type,
      topicId: params.topicId,
    });
    if (this.activeTopic != null && this.stampIntervalSenderTimer == null) {
      // 何か開いたならセット
      this.stampIntervalSenderTimer = stampIntervalSender(
        RoomClass.globalSocket,
        this.id,
        this.stampsQueue
      );
    } else if (
      this.activeTopic == null &&
      this.stampIntervalSenderTimer != null
    ) {
      // 全部閉じたならタイマー解除
      clearInterval(this.stampIntervalSenderTimer);
      //c learIntervalしてもタイマーは残るので、あとでわかるように消す
      this.stampIntervalSenderTimer = null;
    }
  };

  /**
   * トピック終了時の処理を行う
   * @param topicId 終了させるトピックID
   */
  private finishTopic = (topicId: string) => {
    // 質問の集計
    const questions = this.chatItems.filter<QuestionStore>(
      (chatItemStore): chatItemStore is QuestionStore =>
        chatItemStore.type === "question" && chatItemStore.topicId === topicId
    );
    // 回答済みの質問の集計
    const answeredIds = this.chatItems
      .filter<AnswerStore>(
        (chatItemStore): chatItemStore is AnswerStore =>
          chatItemStore.type === "answer" && chatItemStore.topicId === topicId
      )
      .map(({ target }) => target);

    const questionMessages = questions.map(
      ({ id, content }) =>
        `Q. ${content}` + (answeredIds.includes(id) ? " [回答済]" : "")
    );

    // トピック終了のBotメッセージ
    this.sendBotMessage(
      topicId,
      [
        "【運営Bot】\n 発表が終了しました！\n（引き続きコメントを投稿いただけます）",
        questionMessages.length > 0 ? "" : null,
        ...questionMessages,
      ]
        .filter(Boolean)
        .join("\n")
    );
  };

  /**
   * 新しくスタンプが投稿された時に呼ばれる関数。
   * @param userId
   */
  public postStamp = (userId: string, params: PostStampParams) => {
    if (!this.isOpened) {
      throw new Error("[sushi-chat-server] Room is not opened.");
    }
    // ユーザーの存在チェック
    if (!this.userIdExistCheck(userId)) {
      throw new Error("[sushi-chat-server] User does not exists.");
    }
    // TODO: topicIDの存在チェック
    const timestamp = this.getTimestamp(params.topicId);
    // 配列に保存
    this.stamps.push({
      topicId: params.topicId,
      userId,
      timestamp,
      createdAt: new Date(),
    });
    // 配信用に保存
    this.stampsQueue.push({
      userId,
      timestamp,
      topicId: params.topicId,
    });
  };

  /**
   * 新しくチャットが投稿された時に呼ばれる関数。
   * @param userId
   * @param chatItemParams
   */
  public postChatItem = (
    userId: string,
    chatItemParams: PostChatItemParams
  ) => {
    if (!this.isOpened) {
      throw new Error("[sushi-chat-server] Room is not opened.");
    }
    // TODO: not-startedなルームには投稿できない
    // ユーザーの存在チェック
    if (!this.userIdExistCheck(userId)) {
      throw new Error("[sushi-chat-server] User does not exists.");
    }
    // フロントから送られてきたパラメータをこのクラスで保存する形式に変換する
    const chatItem = this.addServerInfo(userId, chatItemParams);
    // 配列に保存
    this.chatItems.push(chatItem);
    // DBに保存
    SaveChatItemClass.pushQueue(chatItem, this.id);
    // サーバでの保存形式をフロントに返すレスポンスの形式に変換して配信する
    RoomClass.globalSocket.emit(
      "PUB_CHAT_ITEM",
      this.chatItemStoreToChatItem(chatItem)
    );
  };

  /**
   * フロントから送られてきたチャットアイテムにサーバーの情報を付与する
   * @param userId ユーザID
   * @param chatItem チャットアイテム
   * @returns
   */
  private addServerInfo = (
    userId: string,
    chatItem: PostChatItemParams
  ): ChatItemStore => {
    const timestamp = this.getTimestamp(chatItem.topicId);
    if (chatItem.type === "reaction") {
      const { reactionToId, ...rest } = chatItem;
      return {
        iconId: this.getIconId(userId) as string,
        createdAt: new Date(),
        target: reactionToId,
        timestamp,
        ...rest,
      };
    } else {
      return {
        iconId: this.getIconId(userId) as string,
        createdAt: new Date(),
        timestamp,
        ...chatItem,
      };
    }
  };

  /**
   * フロントに返すチャットアイテムを整形する関数
   * 具体的にはリプライ先のChatItemなどで、IDのみ保存されている部分をChatItemに置き換えて返す
   *
   * @param chatItemStore
   * @returns フロントに返すためのデータ
   */
  private chatItemStoreToChatItem = (
    chatItemStore: ChatItemStore
  ): ChatItem => {
    if (chatItemStore.type === "message") {
      if (chatItemStore.target == null) {
        // 通常メッセージ
        return {
          ...chatItemStore,
          target: null,
        };
      } else {
        // リプライメッセージ
        // リプライ先のメッセージを取得する
        const targetChatItemStore = this.chatItems.find(
          ({ id, type }) =>
            id === chatItemStore.target &&
            (type === "answer" || type === "message")
        );
        if (targetChatItemStore == null) {
          throw new Error(
            "[sushi-chat-server] Reply target message does not exists."
          );
        }
        return {
          ...chatItemStore,
          target: this.chatItemStoreToChatItem(targetChatItemStore) as
            | Answer
            | Message,
        };
      }
    } else if (chatItemStore.type === "reaction") {
      // リアクション
      const targetChatItemStore = this.chatItems.find(
        ({ id, type }) =>
          id === chatItemStore.target &&
          (type === "message" || type === "question" || type === "answer")
      );
      if (targetChatItemStore == null) {
        throw new Error(
          "[sushi-chat-server] Reaction target message does not exists."
        );
      }
      return {
        ...chatItemStore,
        target: this.chatItemStoreToChatItem(targetChatItemStore) as
          | Message
          | Answer
          | Question,
      };
    } else if (chatItemStore.type === "question") {
      // 質問
      return chatItemStore;
    } else {
      // 回答
      const targetChatItemStore = this.chatItems.find(
        ({ id, type }) => id === chatItemStore.target && type === "question"
      );
      if (targetChatItemStore == null) {
        throw new Error(
          "[sushi-chat-server] Answer target message does not exists."
        );
      }
      return {
        ...chatItemStore,
        target: this.chatItemStoreToChatItem(targetChatItemStore) as Question,
      };
    }
  };

  // Botメッセージ
  private sendBotMessage = (topicId: string, content: string) => {
    const botMessage: MessageStore = {
      type: "message",
      id: getUUID(),
      topicId: topicId,
      iconId: "0",
      timestamp: this.getTimestamp(topicId),
      createdAt: new Date(),
      content: content,
      target: null,
    };
    this.chatItems.push(botMessage);
    RoomClass.globalSocket
      .to(this.id)
      .emit("PUB_CHAT_ITEM", this.chatItemStoreToChatItem(botMessage));
  };

  // utils

  private getTimestamp = (topicId: string) => {
    const openedDate = this.topicTimeData[topicId].openedDate;
    if (openedDate == null) {
      // NOTE: エラー
      return 0;
    }
    const timestamp =
      new Date().getTime() -
      openedDate -
      this.topicTimeData[topicId].offsetTime;
    return timestamp < 0 ? 0 : timestamp;
  };

  private userIdExistCheck = (userId: string) => {
    return this.users.find(({ id }) => id === userId) != null;
  };

  private getIconId = (userId: string) => {
    const iconId = this.users.find(({ id }) => id === userId)?.iconId;
    if (iconId == null) {
      throw new Error("[sushi-chat-server] User does not exists.");
    }
    return iconId;
  };

  private getSocketByUserId = (userId: string) => {
    const socket = this.users.find(({ id }) => id === userId)?.socket;
    if (socket == null) {
      throw new Error("[sushi-chat-server] User does not exists.");
    }
    return socket;
  };

  private get activeTopic() {
    return this.topics.find(({ state }) => state === "active") ?? null;
  }

  private getTopicById = (topicId: string) => {
    return this.topics.find((topic) => topic.id === topicId);
  };
}

export default RoomClass;
