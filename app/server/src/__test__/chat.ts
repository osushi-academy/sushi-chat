import supertest from "supertest"
import { createServer } from "http"
import { io as Client, Socket as ClientSocket } from "socket.io-client"
import { ArrayRange } from "../utils/range"
import createSocketIOServer, { GlobalSocket } from "../ioServer"
import { v4 as uuid } from "uuid"
import RoomRepository from "../infra/repository/room/RoomRepository"
import ChatItemRepository from "../infra/repository/chatItem/ChatItemRepository"
import StampRepository from "../infra/repository/stamp/StampRepository"
import PGPool from "../infra/repository/PGPool"
import UserRepository from "../infra/repository/User/UserRepository"
import AdminRepository from "../infra/repository/admin/AdminRepository"
import StampFactory from "../infra/factory/StampFactory"
import MockAdminAuth from "../infra/auth/MockAdminAuth"
import express from "express"
import { restSetup } from "../rest"
import RestRoomService from "../service/room/RestRoomService"
import RoomFactory from "../infra/factory/RoomFactory"
import AdminService from "../service/admin/AdminService"
import {
  AdminEnterRoomResponse,
  ChatItemModel,
  EnterRoomResponse,
  ErrorResponse,
  PubChangeTopicStateParam,
  PubChatItemParam,
  PubPinnedMessageParam,
  PubStampParam,
  RoomModel,
  RoomState,
  ServerListenEventsMap,
  ServerPubEventsMap,
  StampModel,
  SuccessResponse,
} from "sushi-chat-shared"
import delay from "../utils/delay"
import User from "../domain/user/User"

describe("機能テスト", () => {
  const MATCHING = {
    UUID: expect.stringMatching(/(\w|-)+/),
    DATE: expect.stringMatching(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z/),
    CODE: expect.stringMatching(/[0-9]{3}/),
    TEXT: expect.stringMatching(/.+/),
  }

  const SYSTEM_MESSAGE_CONTENT = {
    start:
      "【運営Bot】\n 発表が始まりました！\nコメントを投稿して盛り上げましょう 🎉🎉\n",
    pause: "【運営Bot】\n発表が中断されました",
    finish:
      "【運営Bot】\n 発表が終了しました！\n（引き続きコメントを投稿いただけます）",
  }

  const SYSTEM_MESSAGE_BASE: Omit<ChatItemModel, "topicId" | "content"> = {
    id: MATCHING.UUID,
    createdAt: MATCHING.DATE,
    type: "message",
    senderType: "system",
    iconId: User.SYSTEM_USER_ICON_ID.valueOf(),
    timestamp: expect.any(Number),
  }

  // RESTクライアント
  let client: supertest.SuperTest<supertest.Test>
  // Socketサーバー
  let io: GlobalSocket
  // 管理者ユーザーのSocketクライアント
  let adminSocket: ClientSocket<ServerPubEventsMap, ServerListenEventsMap>
  // 一般ユーザーのSocketクライアント
  let clientSockets: ClientSocket<ServerPubEventsMap, ServerListenEventsMap>[]
  let pgPool: PGPool

  let roomData: RoomModel
  let messageId: string
  let reactionId: string
  let questionId: string
  let answerId: string
  let notOnGoingTopicMessageId: string
  let message: ChatItemModel
  let reaction: ChatItemModel
  let question: ChatItemModel
  let answer: ChatItemModel
  let notOnGoingTopicMessage: ChatItemModel
  let stamps: StampModel[]
  let history: {
    chatItems: ChatItemModel[]
    stamps: StampModel[]
    pinnedChatItemIds: string[]
  }

  // テストのセットアップ
  beforeAll(async (done) => {
    pgPool = new PGPool(
      process.env.DATABASE_URL as string,
      process.env.DB_SSL !== "OFF",
    )
    const adminRepository = new AdminRepository(pgPool)
    const userRepository = new UserRepository(pgPool)
    const chatItemRepository = new ChatItemRepository(pgPool)
    const stampRepository = new StampRepository(pgPool)
    const roomRepository = new RoomRepository(
      pgPool,
      adminRepository,
      userRepository,
      chatItemRepository,
      stampRepository,
    )
    const roomFactory = new RoomFactory()
    const stampFactory = new StampFactory()
    // TODO: できたら本物のAdminAuthを使いたい
    const adminAuth = new MockAdminAuth({ id: uuid(), name: "Admin" })
    const roomService = new RestRoomService(roomRepository, roomFactory)
    const adminService = new AdminService(
      adminRepository,
      roomRepository,
      adminAuth,
    )

    const app = express()
    const httpServer = createServer(app)
    io = await createSocketIOServer(
      httpServer,
      adminRepository,
      userRepository,
      roomRepository,
      chatItemRepository,
      stampRepository,
      stampFactory,
      adminAuth,
    )
    app.use(express.json())
    restSetup(app, roomService, adminService)
    client = supertest(app)
    httpServer.listen(() => {
      const port = (httpServer.address() as any).port
      const url = `http://localhost:${port}`
      ;[adminSocket, ...clientSockets] = ArrayRange(5).map(() => Client(url))
      done()
    })
  })

  // テストの終了処理
  afterAll(async () => {
    io.close()
    adminSocket.close()
    clientSockets.forEach((socket) => socket.close())
    await pgPool.end()
  })

  describe("ヘルスチェック", () => {
    test("正常系 ヘルスチェックが成功", async () => {
      const res = await client.get("/")

      expect(res.statusCode).toBe(200)
    })
  })

  describe("room作成", () => {
    const title = "テストルーム"
    const topics = [1, 2, 3].map((i) => ({ title: `テストトピック-${i}` }))
    const description = "これはテスト用のルームです。"

    test("正常系_管理者がroomを作成", async () => {
      const res = await client
        .post("/room")
        .send({
          title,
          topics,
          description,
        })
        .set("Authorization", "Bearer token")

      // 後のテストで使う
      roomData = res.body.data

      expect(res.statusCode).toBe(200)
      expect(res.body).toStrictEqual<SuccessResponse<RoomModel>>({
        result: "success",
        data: {
          id: MATCHING.UUID,
          title,
          topics: topics.map((t, i) => ({
            ...t,
            id: i + 1,
            order: i + 1,
          })),
          description,
          state: "not-started",
          adminInviteKey: MATCHING.UUID,
        },
      })
    })
  })

  describe("room一覧取得", () => {
    test("正常系_管理者がroom一覧を取得", async () => {
      const res = await client.get("/room").set("Authorization", "Bearer token")

      expect(res.statusCode).toBe(200)
      expect(res.body).toStrictEqual<SuccessResponse<RoomModel[]>>({
        result: "success",
        data: [roomData],
      })
    })
  })

  describe("新たな管理者をroomに招待する", () => {
    test("正常系_正しいinviteKeyを持った管理者が登録される", async () => {
      const res = await client
        .post(`/room/${roomData.id}/invited`)
        .query({ admin_invite_key: roomData.adminInviteKey })
        .set("Authorization", "Bearer token")

      expect(res.statusCode).toBe(200)
      expect(res.body).toStrictEqual({ result: "success" })
    })
  })

  describe("roomをstartする", () => {
    test("正常系_管理者がroomをstartする", async () => {
      const res = await client
        .put(`/room/${roomData.id}/start`)
        .set("Authorization", "Bearer token")

      expect(res.statusCode).toBe(200)
      expect(res.body).toStrictEqual({ result: "success" })
    })
  })

  describe("room情報を取得", () => {
    test("正常系_一般ユーザーがroom情報を取得", async () => {
      const res = await client.get(`/room/${roomData.id}`)

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { adminInviteKey, ...otherThanInviteKey } = roomData
      expect(res.statusCode).toBe(200)
      expect(res.body).toStrictEqual<SuccessResponse<RoomModel>>({
        result: "success",
        data: {
          ...otherThanInviteKey,
          state: "ongoing",
          startDate: MATCHING.DATE,
        },
      })
    })
  })

  describe("ユーザーがルームに入る", () => {
    afterAll(() => {
      // このステップで定義したlistenerが残っていると以降のテストに支障が出るため解除する。
      // 以降のテストでも同様にlistenerの解除を行なっている。
      clientSockets[0].off("PUB_USER_COUNT")
    })

    test("正常系_管理者がルームに入る", async (resolve) => {
      adminSocket.emit("ADMIN_ENTER_ROOM", { roomId: roomData.id }, (res) => {
        expect(res).toStrictEqual<AdminEnterRoomResponse>({
          result: "success",
          data: {
            chatItems: [],
            stamps: [],
            // NOTE: system userが作成されるので2になる。以後同様に実際より1多い数値になる
            activeUserCount: 2,
            pinnedChatItemIds: roomData.topics.map(() => null),
            topicStates: roomData.topics.map((t) => ({
              topicId: t.id,
              state: "not-started",
            })),
          },
        })
        resolve()
      })
    })

    test("正常系_一般ユーザーがルームに入る", async (resolve) => {
      clientSockets[0].emit(
        "ENTER_ROOM",
        {
          roomId: roomData.id,
          iconId: 1,
          speakerTopicId: roomData.topics[0].id,
        },
        (res) => {
          expect(res).toStrictEqual<AdminEnterRoomResponse>({
            result: "success",
            data: {
              chatItems: [],
              stamps: [],
              // NOTE: system userが作成されるので2になる。以後同様に実際より1多い数値になる
              activeUserCount: 3,
              pinnedChatItemIds: roomData.topics.map(() => null),
              topicStates: roomData.topics.map((t) => ({
                topicId: t.id,
                state: "not-started",
              })),
            },
          })
          resolve()
        },
      )
    })

    test("異常系_存在しないroomには入れない", async (resolve) => {
      clientSockets[2].emit(
        "ENTER_ROOM",
        { roomId: uuid(), iconId: 3, speakerTopicId: 1 },
        (res) => {
          expect(res).toStrictEqual<ErrorResponse>({
            result: "error",
            error: { code: MATCHING.CODE, message: MATCHING.TEXT },
          })
          resolve()
        },
      )
    })

    test("正常系_他のユーザーの入室が配信される", async (resolve) => {
      clientSockets[0].on("PUB_USER_COUNT", (res) => {
        expect(res).toStrictEqual({
          activeUserCount: 4,
        })
        resolve()
      })
      clientSockets[1].emit(
        "ENTER_ROOM",
        {
          roomId: roomData.id,
          iconId: 2,
          speakerTopicId: roomData.topics[2].id,
        },
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        () => {},
      )
    })
  })

  describe("トピックの状態遷移", () => {
    afterEach(async () => {
      // listenerの解除
      clientSockets[0].off("PUB_CHANGE_TOPIC_STATE")
      // DBの処理に若干時間がかかるため、少し待つようにする
      await delay(100)
    })

    test("正常系_1番目のトピックを開始", (resolve) => {
      clientSockets[0].on("PUB_CHANGE_TOPIC_STATE", (res) => {
        expect(res).toStrictEqual<PubChangeTopicStateParam>({
          topicId: roomData.topics[0].id,
          state: "ongoing",
        })
        resolve()
      })
      adminSocket.emit(
        "ADMIN_CHANGE_TOPIC_STATE",
        {
          topicId: roomData.topics[0].id,
          state: "ongoing",
        },
        (res) => {
          expect(res).toStrictEqual({ result: "success" })
        },
      )
    })

    test("正常系_2番目のトピックを開始", (resolve) => {
      clientSockets[0].on("PUB_CHANGE_TOPIC_STATE", (res) => {
        expect(res).toStrictEqual<PubChangeTopicStateParam>({
          topicId: roomData.topics[1].id,
          state: "ongoing",
        })
        resolve()
      })
      adminSocket.emit(
        "ADMIN_CHANGE_TOPIC_STATE",
        {
          topicId: roomData.topics[1].id,
          state: "ongoing",
        },
        (res) => {
          expect(res).toStrictEqual({ result: "success" })
        },
      )
    })

    test("正常系_2番目のトピックを停止", (resolve) => {
      clientSockets[0].on("PUB_CHANGE_TOPIC_STATE", (res) => {
        expect(res).toStrictEqual<PubChangeTopicStateParam>({
          topicId: roomData.topics[1].id,
          state: "finished",
        })
        resolve()
      })
      adminSocket.emit(
        "ADMIN_CHANGE_TOPIC_STATE",
        { topicId: roomData.topics[1].id, state: "finished" },
        (res) => {
          expect(res).toStrictEqual({ result: "success" })
        },
      )
    })

    test("正常系_3番目のトピックを開始", (resolve) => {
      clientSockets[0].on("PUB_CHANGE_TOPIC_STATE", (res) => {
        expect(res).toStrictEqual<PubChangeTopicStateParam>({
          topicId: roomData.topics[2].id,
          state: "ongoing",
        })
        resolve()
      })
      adminSocket.emit(
        "ADMIN_CHANGE_TOPIC_STATE",
        {
          topicId: roomData.topics[2].id,
          state: "ongoing",
        },
        (res) => {
          expect(res).toStrictEqual({ result: "success" })
        },
      )
    })

    test("正常系_3番目のトピックを一時停止", (resolve) => {
      clientSockets[0].on("PUB_CHANGE_TOPIC_STATE", (res) => {
        expect(res).toStrictEqual({
          topicId: roomData.topics[2].id,
          state: "paused",
        })
        resolve()
      })
      adminSocket.emit(
        "ADMIN_CHANGE_TOPIC_STATE",
        {
          topicId: roomData.topics[2].id,
          state: "paused",
        },
        (res) => {
          expect(res).toStrictEqual({ result: "success" })
        },
      )
    })

    test("正常系_3番目のトピックを再開始", (resolve) => {
      clientSockets[0].on("PUB_CHANGE_TOPIC_STATE", (res) => {
        expect(res).toStrictEqual<PubChangeTopicStateParam>({
          topicId: roomData.topics[2].id,
          state: "ongoing",
        })
        resolve()
      })
      adminSocket.emit(
        "ADMIN_CHANGE_TOPIC_STATE",
        {
          topicId: roomData.topics[2].id,
          state: "ongoing",
        },
        (res) => {
          expect(res).toStrictEqual({ result: "success" })
        },
      )
    })
  })

  // NOTE: roomData.topics[2]のトピックが進行中になっている前提
  describe("ChatItemの投稿", () => {
    beforeAll(() => {
      clientSockets[2].emit(
        "ENTER_ROOM",
        {
          roomId: roomData.id,
          iconId: 3,
          speakerTopicId: roomData.topics[0].id,
        },
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        () => {},
      )
    })

    afterEach(() => {
      // listenerを解除
      clientSockets[0].off("PUB_CHAT_ITEM")
    })

    test("正常系_Messageの投稿", (resolve) => {
      messageId = uuid()

      clientSockets[0].on("PUB_CHAT_ITEM", (res) => {
        expect(res).toStrictEqual<PubChatItemParam>({
          id: messageId,
          topicId: roomData.topics[2].id,
          createdAt: MATCHING.DATE,
          type: "message",
          senderType: "speaker",
          iconId: 2,
          content: "コメント",
          timestamp: expect.any(Number),
        })
        message = res
        resolve()
      })
      clientSockets[1].emit(
        "POST_CHAT_ITEM",
        {
          id: messageId,
          topicId: roomData.topics[2].id,
          type: "message",
          content: "コメント",
        },
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        () => {},
      )
    })

    test("正常系_Reactionの投稿", (resolve) => {
      reactionId = uuid()

      clientSockets[0].on("PUB_CHAT_ITEM", (res) => {
        expect(res).toStrictEqual<PubChatItemParam>({
          id: reactionId,
          topicId: roomData.topics[2].id,
          createdAt: MATCHING.DATE,
          type: "reaction",
          senderType: "general",
          iconId: 3,
          quote: message,
          timestamp: expect.any(Number),
        })
        reaction = res
        resolve()
      })
      clientSockets[2].emit(
        "POST_CHAT_ITEM",
        {
          id: reactionId,
          topicId: roomData.topics[2].id,
          type: "reaction",
          quoteId: messageId,
        },
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        () => {},
      )
    })

    test("正常系_Questionの投稿", (resolve) => {
      questionId = uuid()

      clientSockets[0].on("PUB_CHAT_ITEM", (res) => {
        expect(res).toStrictEqual<PubChatItemParam>({
          id: questionId,
          topicId: roomData.topics[2].id,
          createdAt: MATCHING.DATE,
          type: "question",
          senderType: "speaker",
          iconId: 2,
          content: "質問",
          timestamp: expect.any(Number),
        })
        question = res
        resolve()
      })
      clientSockets[1].emit(
        "POST_CHAT_ITEM",
        {
          id: questionId,
          topicId: roomData.topics[2].id,
          type: "question",
          content: "質問",
        },
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        () => {},
      )
    })

    test("正常系_Answerの投稿", (resolve) => {
      answerId = uuid()

      clientSockets[0].on("PUB_CHAT_ITEM", (res) => {
        expect(res).toStrictEqual<PubChatItemParam>({
          id: answerId,
          topicId: roomData.topics[2].id,
          createdAt: MATCHING.DATE,
          type: "answer",
          senderType: "general",
          iconId: 3,
          content: "回答",
          quote: question,
          timestamp: expect.any(Number),
        })
        answer = res
        resolve()
      })
      clientSockets[2].emit(
        "POST_CHAT_ITEM",
        {
          id: answerId,
          topicId: roomData.topics[2].id,
          type: "answer",
          content: "回答",
          quoteId: questionId,
        },
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        () => {},
      )
    })

    test("正常系_進行中でないtopicにも投稿できる", (resolve) => {
      notOnGoingTopicMessageId = uuid()

      clientSockets[0].on("PUB_CHAT_ITEM", (res) => {
        expect(res).toStrictEqual<PubChatItemParam>({
          id: notOnGoingTopicMessageId,
          topicId: roomData.topics[0].id,
          createdAt: MATCHING.DATE,
          type: "message",
          senderType: "speaker",
          iconId: 3,
          content: "ongoingでないトピックへの投稿",
          timestamp: expect.any(Number),
        })
        notOnGoingTopicMessage = res
        resolve()
      })

      clientSockets[2].emit(
        "POST_CHAT_ITEM",
        {
          id: notOnGoingTopicMessageId,
          topicId: roomData.topics[0].id,
          type: "message",
          content: "ongoingでないトピックへの投稿",
        },
        (res) => {
          expect(res).toStrictEqual({
            result: "success",
          })
        },
      )
    })

    test("異常系_存在しないtopicには投稿できない", (resolve) => {
      const notExistTopicId = 10

      clientSockets[1].emit(
        "POST_CHAT_ITEM",
        {
          id: uuid(),
          topicId: notExistTopicId,
          type: "message",
          content: "存在しないトピックへの投稿",
        },
        (res) => {
          expect(res).toStrictEqual<ErrorResponse>({
            result: "error",
            error: {
              code: MATCHING.CODE,
              message: MATCHING.TEXT,
            },
          })
          resolve()
        },
      )
    })
  })

  describe("ChatItemをピン留め", () => {
    afterEach(() => {
      clientSockets[0].off("PUB_PINNED_MESSAGE")
    })

    test("正常系_speakerが進行中のTopicにChatItemをピン留めする", (resolve) => {
      clientSockets[0].on("PUB_PINNED_MESSAGE", (res) => {
        expect(res).toStrictEqual<PubPinnedMessageParam>({
          topicId: roomData.topics[2].id,
          chatItemId: messageId,
        })
        resolve()
      })
      clientSockets[1].emit(
        "POST_PINNED_MESSAGE",
        { topicId: roomData.topics[2].id, chatItemId: messageId },
        (res) => {
          expect(res).toStrictEqual({ result: "success" })
        },
      )
    })

    test("正常系_speakerが進行中でないTopicにChatItemをピン留めする", (resolve) => {
      clientSockets[0].on("PUB_PINNED_MESSAGE", (res) => {
        expect(res).toStrictEqual<PubPinnedMessageParam>({
          topicId: roomData.topics[0].id,
          chatItemId: notOnGoingTopicMessageId,
        })
        resolve()
      })
      clientSockets[2].emit(
        "POST_PINNED_MESSAGE",
        {
          topicId: roomData.topics[0].id,
          chatItemId: notOnGoingTopicMessageId,
        },
        (res) => {
          expect(res).toStrictEqual({ result: "success" })
        },
      )
    })

    // TODO: アプリケーション側が未対応
    test.skip("異常系_speaker以外はピン留めできない", (resolve) => {
      clientSockets[2].emit(
        "POST_PINNED_MESSAGE",
        { topicId: roomData.topics[2].id, chatItemId: messageId },
        (res) => {
          expect(res).toStrictEqual<ErrorResponse>({
            result: "error",
            error: { code: MATCHING.CODE, message: MATCHING.TEXT },
          })
          resolve()
        },
      )
    })
  })

  describe("Stampの投稿", () => {
    afterAll(() => {
      // listenerを解除
      clientSockets[0].off("PUB_STAMP")
    })

    test("正常系_スタンプを投稿する", (resolve) => {
      clientSockets[0].on("PUB_STAMP", (res) => {
        expect(res).toStrictEqual<PubStampParam>([
          {
            id: MATCHING.UUID,
            topicId: roomData.topics[2].id,
            timestamp: expect.any(Number),
            createdAt: MATCHING.DATE,
          },
        ])
        stamps = res
        resolve()
      })
      clientSockets[1].emit(
        "POST_STAMP",
        { topicId: roomData.topics[2].id },
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        () => {},
      )
    })

    // FIXME: アプリケーションの方が未対応
    test.skip("異常系_進行中でないトピックにはスタンプを投稿できない", (resolve) => {
      clientSockets[1].emit(
        "POST_STAMP",
        { topicId: roomData.topics[0].id },
        (res) => {
          expect(res).toStrictEqual<ErrorResponse>({
            result: "error",
            error: { code: MATCHING.CODE, message: MATCHING.TEXT },
          })
          resolve()
        },
      )
    })

    test.skip("異常系_存在しないトピックにはスタンプを投稿できない", (resolve) => {
      const notExistTopicId = 10

      clientSockets[1].emit(
        "POST_STAMP",
        { topicId: notExistTopicId },
        (res) => {
          expect(res).toStrictEqual<ErrorResponse>({
            result: "error",
            error: { code: MATCHING.CODE, message: MATCHING.TEXT },
          })
          resolve()
        },
      )
    })
  })

  describe("途中からルームに入る", () => {
    beforeAll(() => {
      history = {
        // トピックの終了と開始が同時に発生する時、system messageの順番を仕様上規定していないので、
        // 順番を考慮しないようにarrayContainingを使っている
        // chatItems: expect.arrayContaining([
        chatItems: [
          {
            ...SYSTEM_MESSAGE_BASE,
            topicId: roomData.topics[0].id,
            content: SYSTEM_MESSAGE_CONTENT.start,
          },
          {
            ...SYSTEM_MESSAGE_BASE,
            topicId: roomData.topics[0].id,
            content: SYSTEM_MESSAGE_CONTENT.finish,
          },
          {
            ...SYSTEM_MESSAGE_BASE,
            topicId: roomData.topics[1].id,
            content: SYSTEM_MESSAGE_CONTENT.start,
          },
          {
            ...SYSTEM_MESSAGE_BASE,
            topicId: roomData.topics[1].id,
            content: SYSTEM_MESSAGE_CONTENT.finish,
          },
          {
            ...SYSTEM_MESSAGE_BASE,
            topicId: roomData.topics[2].id,
            content: SYSTEM_MESSAGE_CONTENT.start,
          },
          {
            ...SYSTEM_MESSAGE_BASE,
            topicId: roomData.topics[2].id,
            content: SYSTEM_MESSAGE_CONTENT.pause,
          },
          {
            ...SYSTEM_MESSAGE_BASE,
            topicId: roomData.topics[2].id,
            content: SYSTEM_MESSAGE_CONTENT.start,
          },
          message,
          reaction,
          question,
          answer,
          notOnGoingTopicMessage,
        ],
        stamps,
        pinnedChatItemIds: [messageId],
      }
    })

    // TODO: システムメッセージのsenderTypeがadminになってしまっていて落ちるのでskipしている。
    //  アプリケーションコードの修正が必要
    test.skip("正常系_チャットやスタンプの履歴が見れる", (resolve) => {
      clientSockets[3].emit(
        "ENTER_ROOM",
        {
          roomId: roomData.id,
          iconId: 4,
          speakerTopicId: roomData.topics[0].id,
        },
        (res) => {
          expect(res).toStrictEqual<EnterRoomResponse>({
            result: "success",
            data: {
              ...history,
              // ルームに参加しているユーザー(管理者ユーザー + 一般ユーザー) + システムユーザー
              activeUserCount: 1 + clientSockets.length + 1,
              topicStates: [
                {
                  topicId: roomData.topics[0].id,
                  state: "finished",
                },
                { topicId: roomData.topics[1].id, state: "finished" },

                { topicId: roomData.topics[2].id, state: "ongoing" },
              ],
            },
          })
          resolve()
        },
      )
    })
  })

  describe("roomの終了", () => {
    test("正常系_roomを終了する", () => {
      adminSocket.emit("ADMIN_FINISH_ROOM", {}, async (res) => {
        expect(res).toStrictEqual({
          result: "success",
        })

        const roomRes = await client.get(`/room/${roomData.id}`)
        expect(roomRes.body.data.state).toBe<RoomState>("finished")
      })
    })

    test("異常系_存在しないroomを終了しようとするとエラーが返る", () => {
      adminSocket.emit("ADMIN_FINISH_ROOM", {}, async (res) => {
        expect(res).toStrictEqual<ErrorResponse>({
          result: "error",
          error: {
            code: "400",
            message: expect.any(String),
          },
        })
      })
    })
  })
})
