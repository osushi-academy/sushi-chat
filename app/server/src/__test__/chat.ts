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
  ErrorResponse,
  PubChangeTopicStateParam,
  PubChatItemParam,
  RoomModel,
  ServerListenEventsMap,
  ServerPubEventsMap,
  SuccessResponse,
} from "sushi-chat-shared"
import delay from "../utils/delay"
import ChatItem from "../domain/chatItem/ChatItem"

describe("機能テスト", () => {
  const MATCHING = {
    UUID: expect.stringMatching(/(\w|-)+/),
    DATE: expect.stringMatching(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z/),
    CODE: expect.stringMatching(/[0-9]{3}/),
    TEXT: expect.stringMatching(/.+/),
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
  let message: ChatItemModel
  let reaction: ChatItemModel
  let question: ChatItemModel
  let answer: ChatItemModel

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

    messageId = uuid()
    reactionId = uuid()
    questionId = uuid()
    answerId = uuid()

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
        { roomId: roomData.id, iconId: 1, speakerTopicId: 1 },
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
        { roomId: roomData.id, iconId: 2, speakerTopicId: 3 },
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

  describe("コメントを投稿する", () => {
    beforeAll(() => {
      clientSockets[2].emit(
        "ENTER_ROOM",
        { roomId: roomData.id, iconId: 3, speakerTopicId: 0 },
        () => {},
      )
    })

    afterEach(() => {
      // listenerを解除
      clientSockets[0].off("PUB_CHAT_ITEM")
    })

    test("正常系_Messageの投稿", (resolve) => {
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
        () => {},
      )
    })

    test("正常系_Reactionの投稿", (resolve) => {
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
        () => {},
      )
    })

    test("正常系_Questionの投稿", (resolve) => {
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
        () => {},
      )
    })

    test("正常系_Answerの投稿", (resolve) => {
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
        () => {},
      )
    })

    test("異常系_存在しないtopicには投稿できない", () => {
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
        },
      )
    })
  })

  // describe("スタンプの投稿", () => {
  //   test("スタンプを投稿する", (resolve) => {
  //     clientSockets[0].on("PUB_STAMP", (res) => {
  //       expect(res).toStrictEqual([
  //         {
  //           userId: clientSockets[2].id,
  //           timestamp: expect.any(Number),
  //           topicId: topics[0].id,
  //         },
  //       ])
  //       resolve()
  //     })
  //     clientSockets[2].emit("POST_STAMP", { topicId: topics[0].id })
  //   })
  // })
  //
  // describe("途中から入室した場合", () => {
  //   beforeAll(async () => await delay(100))
  //
  //   test("途中から入室した場合に履歴が見れる", (resolve) => {
  //     clientSockets[3].emit(
  //       "ENTER_ROOM",
  //       { roomId, iconId: "4" },
  //       (res: any) => {
  //         expect(res).toStrictEqual({
  //           // NOTE: changeTopicStateで現在開いているトピックを閉じた際のbotメッセージと、次のトピックが開いた際の
  //           //  botメッセージが同時に追加されるが、それらがDBに格納される順序が不安定だったため、順序を考慮しないように
  //           //  している。アプリケーションの挙動としてはそれらは別トピックに投稿されるメッセージのため、問題はないはず。
  //           chatItems: expect.arrayContaining([
  //             {
  //               timestamp: expect.any(Number),
  //               iconId: "0",
  //               createdAt: expect.stringMatching(
  //                 /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z/,
  //               ),
  //               id: expect.any(String),
  //               topicId: "1",
  //               type: "message",
  //               content:
  //                 "【運営Bot】\n 発表が始まりました！\nコメントを投稿して盛り上げましょう 🎉🎉\n",
  //               target: null,
  //             },
  //             {
  //               timestamp: expect.any(Number),
  //               iconId: "0",
  //               createdAt: expect.stringMatching(
  //                 /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z/,
  //               ),
  //               id: expect.any(String),
  //               topicId: "1",
  //               type: "message",
  //               content:
  //                 "【運営Bot】\n 発表が終了しました！\n（引き続きコメントを投稿いただけます）",
  //               target: null,
  //             },
  //             {
  //               timestamp: expect.any(Number),
  //               iconId: "0",
  //               createdAt: expect.stringMatching(
  //                 /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z/,
  //               ),
  //               id: expect.any(String),
  //               topicId: "2",
  //               type: "message",
  //               content:
  //                 "【運営Bot】\n 発表が始まりました！\nコメントを投稿して盛り上げましょう 🎉🎉\n",
  //               target: null,
  //             },
  //             {
  //               timestamp: expect.any(Number),
  //               iconId: "0",
  //               createdAt: expect.stringMatching(
  //                 /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z/,
  //               ),
  //               id: expect.any(String),
  //               topicId: "2",
  //               type: "message",
  //               content:
  //                 "【運営Bot】\n 発表が終了しました！\n（引き続きコメントを投稿いただけます）",
  //               target: null,
  //             },
  //             {
  //               timestamp: expect.any(Number),
  //               iconId: "0",
  //               createdAt: expect.stringMatching(
  //                 /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z/,
  //               ),
  //               id: expect.any(String),
  //               topicId: "3",
  //               type: "message",
  //               content:
  //                 "【運営Bot】\n 発表が始まりました！\nコメントを投稿して盛り上げましょう 🎉🎉\n",
  //               target: null,
  //             },
  //             {
  //               timestamp: expect.any(Number),
  //               iconId: "0",
  //               createdAt: expect.stringMatching(
  //                 /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z/,
  //               ),
  //               id: expect.any(String),
  //               topicId: "3",
  //               type: "message",
  //               content: "【運営Bot】\n 発表が中断されました",
  //               target: null,
  //             },
  //             {
  //               timestamp: expect.any(Number),
  //               iconId: "0",
  //               createdAt: expect.stringMatching(
  //                 /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z/,
  //               ),
  //               id: expect.any(String),
  //               topicId: "1",
  //               type: "message",
  //               content: "【運営Bot】\n 発表が再開されました",
  //               target: null,
  //             },
  //             {
  //               timestamp: expect.any(Number),
  //               iconId: "2",
  //               createdAt: expect.stringMatching(
  //                 /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z/,
  //               ),
  //               id: messageId,
  //               topicId: "1",
  //               type: "message",
  //               content: "コメント",
  //               target: null,
  //             },
  //             {
  //               timestamp: expect.any(Number),
  //               iconId: "3",
  //               createdAt: expect.stringMatching(
  //                 /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z/,
  //               ),
  //               target: {
  //                 id: messageId,
  //                 topicId: topics[0].id,
  //                 type: "message",
  //                 iconId: "2",
  //                 timestamp: expect.any(Number),
  //                 createdAt: expect.stringMatching(
  //                   /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z/,
  //                 ),
  //                 content: "コメント",
  //                 target: null,
  //               },
  //               id: reactionId,
  //               topicId: "1",
  //               type: "reaction",
  //             },
  //             {
  //               timestamp: expect.any(Number),
  //               iconId: "2",
  //               createdAt: expect.stringMatching(
  //                 /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z/,
  //               ),
  //               id: questionId,
  //               topicId: "1",
  //               type: "question",
  //               content: "質問",
  //             },
  //             {
  //               timestamp: expect.any(Number),
  //               iconId: "3",
  //               createdAt: expect.stringMatching(
  //                 /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z/,
  //               ),
  //               id: answerId,
  //               topicId: "1",
  //               type: "answer",
  //               content: "回答",
  //               target: {
  //                 id: questionId,
  //                 topicId: topics[0].id,
  //                 type: "question",
  //                 iconId: "2",
  //                 timestamp: expect.any(Number),
  //                 createdAt: expect.stringMatching(
  //                   /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z/,
  //                 ),
  //                 content: "質問",
  //               },
  //             },
  //           ]),
  //           topics: [
  //             { ...topics[0], state: "active" },
  //             { ...topics[1], state: "finished" },
  //             { ...topics[2], state: "paused" },
  //             ...topics.slice(3),
  //           ],
  //           activeUserCount: 5,
  //         })
  //         resolve()
  //       },
  //     )
  //   })
  // })
  //
  // describe("ルームの終了・閉じる", () => {
  //   test("ルームを終了する", (resolve) => {
  //     clientSockets[0].on("PUB_FINISH_ROOM", () => {
  //       resolve()
  //     })
  //     adminSocket.emit("ADMIN_FINISH_ROOM", {})
  //   })
  //
  //   test("ルームを閉じる", (resolve) => {
  //     clientSockets[0].on("PUB_CLOSE_ROOM", () => {
  //       resolve()
  //     })
  //     adminSocket.emit("ADMIN_CLOSE_ROOM", {})
  //   })
  // })
})
