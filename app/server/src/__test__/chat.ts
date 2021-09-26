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
  RoomModel,
  ServerListenEventsMap,
  ServerPubEventsMap,
  SuccessResponse,
} from "sushi-chat-shared"

describe("機能テスト", () => {
  const MATCHING = {
    UUID: expect.stringMatching(/(\w|-)+/),
    DATE: expect.stringMatching(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z/),
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
    test("[GET] /", async () => {
      const res = await client.get("/")

      expect(res.statusCode).toBe(200)
    })
  })

  describe("管理者が初めてアクセスし、roomを作成する", () => {
    const title = "テストルーム"
    const topics = [1, 2].map((i) => ({ title: `テストトピック-${i}` }))
    const description = "これはテスト用のルームです。"

    test("[POST] /room", async () => {
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

  describe("管理者がroom一覧を取得する", () => {
    test("[GET] /room", async () => {
      const res = await client.get("/room").set("Authorization", "Bearer token")

      expect(res.statusCode).toBe(200)
      expect(res.body).toStrictEqual<SuccessResponse<RoomModel[]>>({
        result: "success",
        data: [roomData],
      })
    })
  })

  describe("新たな管理者をroomに招待する", () => {
    test("[POST] /room/:id/invited", async () => {
      const res = await client
        .post(`/room/${roomData.id}/invited`)
        .query({ admin_invite_key: roomData.adminInviteKey })
        .set("Authorization", "Bearer token")

      expect(res.statusCode).toBe(200)
      expect(res.body).toStrictEqual({ result: "success" })
    })
  })

  describe("管理者がroomをstartする", () => {
    test("[PUT] /room/:id/start", async () => {
      const res = await client
        .put(`/room/${roomData.id}/start`)
        .set("Authorization", "Bearer token")

      expect(res.statusCode).toBe(200)
      expect(res.body).toStrictEqual({ result: "success" })
    })
  })

  describe("一般ユーザーがroom情報を取得する", () => {
    test("[GET] /room/:id", async () => {
      const res = await client.get(`/room/${roomData.id}`)

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

  // const messageId = uuid()
  // const reactionId = uuid()
  // const questionId = uuid()
  // const answerId = uuid()
  //
  // describe("ユーザーがルームに入る", () => {
  //   afterAll(() => {
  //     clientSockets[0].off("PUB_ENTER_ROOM")
  //   })
  //
  //   test("管理者がルームに入る", async (resolve) => {
  //     adminSocket.emit("ADMIN_ENTER_ROOM", { roomId: roomData.id }, (res) => {
  //       expect(res).toStrictEqual<AdminEnterRoomResponse>({
  //         result: "success",
  //         data: {
  //           chatItems: [],
  //           stamps: [],
  //           activeUserCount: 1,
  //           pinnedChatItemIds: [],
  //           topicStates: [],
  //         },
  //       })
  //       resolve()
  //     })
  //   })
  //   test("ユーザーがルームに入る", async (resolve) => {
  //     clientSockets[0].emit(
  //       "ENTER_ROOM",
  //       { roomId, iconId: "1" },
  //       (res: any) => {
  //         expect(res).toStrictEqual({
  //           chatItems: [],
  //           topics: expectedTopics,
  //           activeUserCount: 2,
  //         })
  //         resolve()
  //       },
  //     )
  //   })
  //   test("ユーザーの入室が配信される", async (resolve) => {
  //     clientSockets[0].on("PUB_ENTER_ROOM", (res) => {
  //       expect(res).toStrictEqual({
  //         iconId: "2",
  //         activeUserCount: 3,
  //       })
  //       resolve()
  //     })
  //     clientSockets[1].emit(
  //       "ENTER_ROOM",
  //       { roomId, iconId: "2" },
  //       (res: any) => {},
  //     )
  //   })
  //   test.skip("存在しない部屋には入れない", async (resolve) => {
  //     // TODO: サーバー側でエラー発生時にクライアントにメッセージを返さないようになっているので、テストがタイムアウトに
  //     //  なってfailしてしまう。実装を直す必要あり。
  //     clientSockets[2].on("error", (res: any) => {
  //       // TODO: エラーレスポンスのフォーマットを決め、エラーチェックをする
  //       resolve()
  //     })
  //     clientSockets[2].emit(
  //       "ENTER_ROOM",
  //       { roomId: "dasldksamk", iconId: "2" },
  //       () => {},
  //     )
  //   })
  // })
  //
  // describe("ルームの開始・トピックの遷移", () => {
  //   // NOTE: DBのトピック状態更新処理にタイムラグがあり、少し遅延させないとデータの不整合が起きる場合がある。
  //   //  実際の使用時にはトピックの状態の更新がミリ秒単位で行われることはないと考え、許容できるという判断
  //   beforeEach(async () => await delay(100))
  //
  //   afterEach(() => {
  //     clientSockets[0].off("PUB_CHANGE_TOPIC_STATE")
  //   })
  //
  //   test("ルームの開始", (resolve) => {
  //     clientSockets[0].on("PUB_START_ROOM", (res) => {
  //       expect(res).toStrictEqual({})
  //       resolve()
  //     })
  //     adminSocket.emit("ADMIN_START_ROOM", {})
  //   })
  //
  //   test("0番目のトピックのオープン", (resolve) => {
  //     clientSockets[0].on("PUB_CHANGE_TOPIC_STATE", (res) => {
  //       expect(res).toStrictEqual({
  //         type: "OPEN",
  //         topicId: topics[0].id,
  //       })
  //       resolve()
  //     })
  //     adminSocket.emit("ADMIN_CHANGE_TOPIC_STATE", {
  //       roomId,
  //       type: "OPEN",
  //       topicId: topics[0].id,
  //     })
  //   })
  //
  //   test("1番目のトピックをオープン", (resolve) => {
  //     clientSockets[0].on("PUB_CHANGE_TOPIC_STATE", (res) => {
  //       expect(res).toStrictEqual({
  //         type: "OPEN",
  //         topicId: topics[1].id,
  //       })
  //       resolve()
  //     })
  //     adminSocket.emit("ADMIN_CHANGE_TOPIC_STATE", {
  //       roomId,
  //       type: "OPEN",
  //       topicId: topics[1].id,
  //     })
  //   })
  //
  //   test("2番目のトピックをオープン", (resolve) => {
  //     clientSockets[0].on("PUB_CHANGE_TOPIC_STATE", (res) => {
  //       expect(res).toStrictEqual({
  //         type: "OPEN",
  //         topicId: topics[2].id,
  //       })
  //       resolve()
  //     })
  //     adminSocket.emit("ADMIN_CHANGE_TOPIC_STATE", {
  //       roomId,
  //       type: "OPEN",
  //       topicId: topics[2].id,
  //     })
  //   })
  //
  //   test("2番目のトピックを一時停止", (resolve) => {
  //     clientSockets[0].on("PUB_CHANGE_TOPIC_STATE", (res) => {
  //       expect(res).toStrictEqual({
  //         type: "PAUSE",
  //         topicId: topics[2].id,
  //       })
  //       resolve()
  //     })
  //     adminSocket.emit("ADMIN_CHANGE_TOPIC_STATE", {
  //       roomId,
  //       type: "PAUSE",
  //       topicId: topics[2].id,
  //     })
  //   })
  //
  //   test("0番目のトピックをオープン", (resolve) => {
  //     clientSockets[0].on("PUB_CHANGE_TOPIC_STATE", (res) => {
  //       expect(res).toStrictEqual({
  //         type: "OPEN",
  //         topicId: topics[0].id,
  //       })
  //       resolve()
  //     })
  //     adminSocket.emit("ADMIN_CHANGE_TOPIC_STATE", {
  //       roomId,
  //       type: "OPEN",
  //       topicId: topics[0].id,
  //     })
  //   })
  // })
  //
  // describe("コメントを投稿する", () => {
  //   beforeAll(() => {
  //     clientSockets[2].emit(
  //       "ENTER_ROOM",
  //       { roomId, iconId: "3" },
  //       (res: any) => {},
  //     )
  //   })
  //
  //   afterEach(() => {
  //     clientSockets[0].off("PUB_CHAT_ITEM")
  //   })
  //
  //   beforeEach(async () => await delay(100))
  //
  //   test("Messageの投稿", (resolve) => {
  //     clientSockets[0].on("PUB_CHAT_ITEM", (res) => {
  //       expect(res).toStrictEqual({
  //         id: messageId,
  //         topicId: topics[0].id,
  //         type: "message",
  //         iconId: "2",
  //         timestamp: expect.any(Number),
  //         createdAt: expect.stringMatching(
  //           /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z/,
  //         ),
  //         content: "コメント",
  //         target: null,
  //       })
  //       resolve()
  //     })
  //     clientSockets[1].emit("POST_CHAT_ITEM", {
  //       id: messageId,
  //       topicId: topics[0].id,
  //       type: "message",
  //       content: "コメント",
  //     })
  //   })
  //
  //   test("Reactionの投稿", (resolve) => {
  //     clientSockets[0].on("PUB_CHAT_ITEM", (res) => {
  //       expect(res).toStrictEqual({
  //         id: reactionId,
  //         topicId: topics[0].id,
  //         type: "reaction",
  //         iconId: "3",
  //         timestamp: expect.any(Number),
  //         createdAt: expect.stringMatching(
  //           /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z/,
  //         ),
  //         target: {
  //           id: messageId,
  //           topicId: topics[0].id,
  //           type: "message",
  //           iconId: "2",
  //           timestamp: expect.any(Number),
  //           createdAt: expect.stringMatching(
  //             /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z/,
  //           ),
  //           content: "コメント",
  //           target: null,
  //         },
  //       })
  //       resolve()
  //     })
  //     clientSockets[2].emit("POST_CHAT_ITEM", {
  //       id: reactionId,
  //       topicId: topics[0].id,
  //       type: "reaction",
  //       reactionToId: messageId,
  //     })
  //   })
  //
  //   test("Questionの投稿", (resolve) => {
  //     clientSockets[0].on("PUB_CHAT_ITEM", (res) => {
  //       expect(res).toStrictEqual({
  //         id: questionId,
  //         topicId: topics[0].id,
  //         type: "question",
  //         iconId: "2",
  //         timestamp: expect.any(Number),
  //         createdAt: expect.stringMatching(
  //           /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z/,
  //         ),
  //         content: "質問",
  //       })
  //       resolve()
  //     })
  //     clientSockets[1].emit("POST_CHAT_ITEM", {
  //       id: questionId,
  //       topicId: topics[0].id,
  //       type: "question",
  //       content: "質問",
  //     })
  //   })
  //
  //   test("Answerの投稿", (resolve) => {
  //     clientSockets[0].on("PUB_CHAT_ITEM", (res) => {
  //       expect(res).toStrictEqual({
  //         id: answerId,
  //         topicId: topics[0].id,
  //         type: "answer",
  //         iconId: "3",
  //         timestamp: expect.any(Number),
  //         createdAt: expect.stringMatching(
  //           /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z/,
  //         ),
  //         content: "回答",
  //         target: {
  //           id: questionId,
  //           topicId: topics[0].id,
  //           type: "question",
  //           iconId: "2",
  //           timestamp: expect.any(Number),
  //           createdAt: expect.stringMatching(
  //             /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z/,
  //           ),
  //           content: "質問",
  //         },
  //       })
  //       resolve()
  //     })
  //     clientSockets[2].emit("POST_CHAT_ITEM", {
  //       id: answerId,
  //       topicId: topics[0].id,
  //       type: "answer",
  //       content: "回答",
  //       target: questionId,
  //     })
  //   })
  // })
  //
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
