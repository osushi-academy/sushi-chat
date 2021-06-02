import { createServer } from "http";
import { Server } from "socket.io";
import { io as Client, Socket as ClientSocket } from "socket.io-client";
import { ArrayRange } from "../utils/range";
import createSocketIOServer from "../ioServer";
import { AdminBuildRoomParams } from "../events";
import { Topic } from "../topic";

describe("機能テスト", () => {
  let io: Server;
  let adminSocket: ClientSocket;
  let clientSockets: ClientSocket[];

  // テストのセットアップ
  beforeAll((done) => {
    const httpServer = createServer();
    createSocketIOServer(httpServer).then((r) => (io = r));
    httpServer.listen(async () => {
      const port = (httpServer as any).address().port;
      [adminSocket, ...clientSockets] = ArrayRange(5).map(() =>
        Client(`http://localhost:${port}`)
      );
      done();
    });
  });

  // テストの終了処理
  afterAll(() => {
    io.close();
    adminSocket.close();
    clientSockets.forEach((socket) => socket.close());
  });

  let roomId: string;
  let topics: Topic[];
  const roomDataParams: AdminBuildRoomParams = {
    title: "TEST_ROOM_TITLE",
    topics: ArrayRange(10).map((i) => ({
      title: `TEST_TOPIC_TITLE-${i}`,
      description: `TEST_TOPIC_DESCRIPTION-${i}`,
      urls: {
        github: `https://example.com/github/${i}`,
        slide: `https://example.com/slide/${i}`,
        product: `https://example.com/our-product/${i}`,
      },
    })),
  };

  const expectedTopics = roomDataParams.topics.map((topic) => ({
    ...topic,
    id: expect.any(String),
    state: "not-started",
  }));

  describe("ルームを立てる", () => {
    test("管理者がルームを立てる", async (resolve) => {
      adminSocket.emit("ADMIN_BUILD_ROOM", roomDataParams, (res: any) => {
        roomId = res.id;
        topics = res.topics;
        expect(res).toStrictEqual({
          id: expect.any(String),
          title: roomDataParams.title,
          topics: expectedTopics,
        });
        resolve();
      });
    });
  });

  describe("ユーザーがルームに入る", () => {
    afterAll(() => {
      clientSockets[0].off("PUB_ENTER_ROOM");
    });
    test("管理者がルームに入る", async (resolve) => {
      // 管理者がルームに入る
      adminSocket.emit("ADMIN_ENTER_ROOM", { roomId }, (res: any) => {
        expect(res).toStrictEqual({
          chatItems: [],
          topics: expectedTopics,
          activeUserCount: 1,
        });
        resolve();
      });
    });
    test("ユーザーがルームに入る", async (resolve) => {
      clientSockets[0].emit(
        "ENTER_ROOM",
        { roomId, iconId: "1" },
        (res: any) => {
          expect(res).toStrictEqual({
            chatItems: [],
            topics: expectedTopics,
            activeUserCount: 2,
          });
          resolve();
        }
      );
    });
    test("ユーザーの入室が配信される", async (resolve) => {
      clientSockets[0].on("PUB_ENTER_ROOM", (res) => {
        expect(res).toStrictEqual({
          iconId: "2",
          activeUserCount: 3,
        });
        resolve();
      });
      clientSockets[1].emit(
        "ENTER_ROOM",
        { roomId, iconId: "2" },
        (res: any) => {}
      );
    });
    test.skip("存在しない部屋には入れない", async (resolve) => {
      // TODO: エラー発生の確認がうまくできない
      clientSockets[2].on("error", (res: any) => {
        console.log(res);
      });
      clientSockets[2].emit(
        "ENTER_ROOM",
        { roomId: "dasldksamk", iconId: "2" },
        () => {}
      );
    });
  });

  describe("ルームの開始・トピックの遷移", () => {
    afterEach(() => {
      clientSockets[0].off("PUB_CHANGE_TOPIC_STATE");
    });

    test("ルームの開始", (resolve) => {
      clientSockets[0].on("PUB_START_ROOM", () => {
        resolve();
      });
      adminSocket.emit("ADMIN_START_ROOM", {});
    });

    test("0番目のトピックのオープン", (resolve) => {
      clientSockets[0].on("PUB_CHANGE_TOPIC_STATE", (res) => {
        expect(res).toStrictEqual({
          type: "OPEN",
          topicId: topics[0].id,
        });
        resolve();
      });
      adminSocket.emit("ADMIN_CHANGE_TOPIC_STATE", {
        roomId,
        type: "OPEN",
        topicId: topics[0].id,
      });
    });

    test("1番目のトピックをオープン", (resolve) => {
      clientSockets[0].on("PUB_CHANGE_TOPIC_STATE", (res) => {
        expect(res).toStrictEqual({
          type: "OPEN",
          topicId: topics[1].id,
        });
        resolve();
      });
      adminSocket.emit("ADMIN_CHANGE_TOPIC_STATE", {
        roomId,
        type: "OPEN",
        topicId: topics[1].id,
      });
    });

    test("2番目のトピックをオープン", (resolve) => {
      clientSockets[0].on("PUB_CHANGE_TOPIC_STATE", (res) => {
        expect(res).toStrictEqual({
          type: "OPEN",
          topicId: topics[2].id,
        });
        resolve();
      });
      adminSocket.emit("ADMIN_CHANGE_TOPIC_STATE", {
        roomId,
        type: "OPEN",
        topicId: topics[2].id,
      });
    });

    test("2番目のトピックを一時停止", (resolve) => {
      clientSockets[0].on("PUB_CHANGE_TOPIC_STATE", (res) => {
        expect(res).toStrictEqual({
          type: "PAUSE",
          topicId: topics[2].id,
        });
        resolve();
      });
      adminSocket.emit("ADMIN_CHANGE_TOPIC_STATE", {
        roomId,
        type: "PAUSE",
        topicId: topics[2].id,
      });
    });

    test("0番目のトピックをオープン", (resolve) => {
      clientSockets[0].on("PUB_CHANGE_TOPIC_STATE", (res) => {
        expect(res).toStrictEqual({
          type: "OPEN",
          topicId: topics[0].id,
        });
        resolve();
      });
      adminSocket.emit("ADMIN_CHANGE_TOPIC_STATE", {
        roomId,
        type: "OPEN",
        topicId: topics[0].id,
      });
    });
  });

  describe("コメントを投稿する", () => {
    beforeAll(() => {
      clientSockets[2].emit(
        "ENTER_ROOM",
        { roomId, iconId: "3" },
        (res: any) => {}
      );
    });
    afterEach(() => {
      clientSockets[0].off("PUB_CHAT_ITEM");
    });

    test("Messageの投稿", (resolve) => {
      clientSockets[0].on("PUB_CHAT_ITEM", (res) => {
        expect(res).toStrictEqual({
          id: "001",
          topicId: topics[0].id,
          type: "message",
          iconId: "2",
          timestamp: expect.any(Number),
          createdAt: expect.stringMatching(
            /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z/
          ),
          content: "コメント",
          target: null,
        });
        resolve();
      });
      clientSockets[1].emit("POST_CHAT_ITEM", {
        id: "001",
        topicId: topics[0].id,
        type: "message",
        content: "コメント",
      });
    });

    test("Reactionの投稿", (resolve) => {
      clientSockets[0].on("PUB_CHAT_ITEM", (res) => {
        expect(res).toStrictEqual({
          id: "002",
          topicId: topics[0].id,
          type: "reaction",
          iconId: "3",
          timestamp: expect.any(Number),
          createdAt: expect.stringMatching(
            /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z/
          ),
          target: {
            id: "001",
            topicId: topics[0].id,
            type: "message",
            iconId: "2",
            timestamp: expect.any(Number),
            createdAt: expect.stringMatching(
              /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z/
            ),
            content: "コメント",
            target: null,
          },
        });
        resolve();
      });
      clientSockets[2].emit("POST_CHAT_ITEM", {
        id: "002",
        topicId: topics[0].id,
        type: "reaction",
        reactionToId: "001",
      });
    });

    test("Questionの投稿", (resolve) => {
      clientSockets[0].on("PUB_CHAT_ITEM", (res) => {
        expect(res).toStrictEqual({
          id: "003",
          topicId: topics[0].id,
          type: "question",
          iconId: "2",
          timestamp: expect.any(Number),
          createdAt: expect.stringMatching(
            /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z/
          ),
          content: "質問",
        });
        resolve();
      });
      clientSockets[1].emit("POST_CHAT_ITEM", {
        id: "003",
        topicId: topics[0].id,
        type: "question",
        content: "質問",
      });
    });

    test("Answerの投稿", (resolve) => {
      clientSockets[0].on("PUB_CHAT_ITEM", (res) => {
        expect(res).toStrictEqual({
          id: "004",
          topicId: topics[0].id,
          type: "answer",
          iconId: "3",
          timestamp: expect.any(Number),
          createdAt: expect.stringMatching(
            /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z/
          ),
          content: "回答",
          target: {
            id: "003",
            topicId: topics[0].id,
            type: "question",
            iconId: "2",
            timestamp: expect.any(Number),
            createdAt: expect.stringMatching(
              /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z/
            ),
            content: "質問",
          },
        });
        resolve();
      });
      clientSockets[2].emit("POST_CHAT_ITEM", {
        id: "004",
        topicId: topics[0].id,
        type: "answer",
        content: "回答",
        target: "003",
      });
    });
  });

  describe("スタンプの投稿", () => {
    test("スタンプを投稿する", (resolve) => {
      clientSockets[0].on("PUB_STAMP", (res) => {
        expect(res).toStrictEqual({
          iconId: "3",
          topicId: topics[0].id,
        });
        resolve();
      });
      clientSockets[2].emit("POST_STAMP", { topicId: topics[0].id });
    });
  });

  describe("途中から入室した場合", () => {
    test("途中から入室した場合に履歴が見れる", (resolve) => {
      clientSockets[3].emit(
        "ENTER_ROOM",
        { roomId, iconId: "4" },
        (res: any) => {
          expect(res).toStrictEqual({
            chatItems: [
              {
                timestamp: expect.any(Number),
                iconId: "2",
                createdAt: expect.stringMatching(
                  /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z/
                ),
                id: "001",
                topicId: "1",
                type: "message",
                content: "コメント",
                target: null,
              },
              {
                timestamp: expect.any(Number),
                iconId: "3",
                createdAt: expect.stringMatching(
                  /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z/
                ),
                target: {
                  id: "001",
                  topicId: topics[0].id,
                  type: "message",
                  iconId: "2",
                  timestamp: expect.any(Number),
                  createdAt: expect.stringMatching(
                    /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z/
                  ),
                  content: "コメント",
                  target: null,
                },
                id: "002",
                topicId: "1",
                type: "reaction",
              },
              {
                timestamp: expect.any(Number),
                iconId: "2",
                createdAt: expect.stringMatching(
                  /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z/
                ),
                id: "003",
                topicId: "1",
                type: "question",
                content: "質問",
              },
              {
                timestamp: expect.any(Number),
                iconId: "3",
                createdAt: expect.stringMatching(
                  /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z/
                ),
                id: "004",
                topicId: "1",
                type: "answer",
                content: "回答",
                target: {
                  id: "003",
                  topicId: topics[0].id,
                  type: "question",
                  iconId: "2",
                  timestamp: expect.any(Number),
                  createdAt: expect.stringMatching(
                    /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z/
                  ),
                  content: "質問",
                },
              },
            ],
            topics: [
              { ...topics[0], state: "active" },
              { ...topics[1], state: "finished" },
              { ...topics[2], state: "paused" },
              ...topics.slice(3),
            ],
            activeUserCount: 5,
          });
          resolve();
        }
      );
    });
  });

  describe("ルームの終了・閉じる", () => {
    test("ルームを終了する", (resolve) => {
      clientSockets[0].on("PUB_FINISH_ROOM", () => {
        resolve();
      });
      adminSocket.emit("ADMIN_FINISH_ROOM", {});
    });

    test("ルームを閉じる", (resolve) => {
      clientSockets[0].on("PUB_CLOSE_ROOM", () => {
        resolve();
      });
      adminSocket.emit("ADMIN_CLOSE_ROOM", {});
    });
  });
});
