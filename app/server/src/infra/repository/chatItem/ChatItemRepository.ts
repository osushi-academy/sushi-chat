import IChatItemRepository from "../../../domain/chatItem/IChatItemRepository"
import Message from "../../../domain/chatItem/Message"
import Reaction from "../../../domain/chatItem/Reaction"
import Question from "../../../domain/chatItem/Question"
import Answer from "../../../domain/chatItem/Answer"
import ChatItem from "../../../domain/chatItem/ChatItem"
import { ChatItemType } from "../../../chatItem"
import { Pool } from "pg"

class ChatItemRepository implements IChatItemRepository {
  constructor(private readonly pgPool: Pool) {}

  public async saveMessage(message: Message): Promise<void> {
    const pgClient = await this.pgPool.connect()

    const query =
      "INSERT INTO Chatitems (id, type, roomid, topicid, iconid, timestamp, createdat, content, targetid) " +
      "VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)"
    const type: ChatItemType = "message"

    try {
      await pgClient.query(query, [
        message.id,
        type,
        message.roomId,
        message.topicId,
        message.userIconId,
        message.timestamp,
        ChatItemRepository.formatDate(message.createdAt),
        message.content,
        message.target ? message.target.id : null,
      ])
    } catch (e) {
      console.error(
        `${e.message ?? "Unknown error."} (SAVE ROOM/TOPIC IN DB)`,
        new Date().toISOString(),
      )
      throw e
    } finally {
      pgClient.release()
    }
  }

  public async saveReaction(reaction: Reaction): Promise<void> {
    const pgClient = await this.pgPool.connect()

    const query =
      "INSERT INTO Chatitems (id, type, roomid, topicid, iconid, timestamp, createdat, content, targetid) " +
      "VALUES ($1, $2, $3, $4, $5, $6, $7, NULL, $8)"
    const type: ChatItemType = "reaction"

    try {
      await pgClient.query(query, [
        reaction.id,
        type,
        reaction.roomId,
        reaction.topicId,
        reaction.userIconId,
        reaction.timestamp,
        ChatItemRepository.formatDate(reaction.createdAt),
        reaction.target.id,
      ])
    } catch (e) {
      console.log(
        `${e.message ?? "Unknown error."} (SAVE ROOM/TOPIC IN DB)`,
        new Date().toISOString(),
      )

      throw e
    } finally {
      pgClient.release()
    }
  }

  public async saveQuestion(question: Question): Promise<void> {
    const pgClient = await this.pgPool.connect()

    const query =
      "INSERT INTO Chatitems (id, type, roomid, topicid, iconid, timestamp, createdat, content, targetid) " +
      "VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NULL)"
    const type: ChatItemType = "question"

    try {
      await pgClient.query(query, [
        question.id,
        type,
        question.roomId,
        question.topicId,
        question.userIconId,
        question.timestamp,
        ChatItemRepository.formatDate(question.createdAt),
        question.content,
      ])
    } catch (e) {
      console.log(
        `${e.message ?? "Unknown error."} (SAVE ROOM/TOPIC IN DB)`,
        new Date().toISOString(),
      )
      throw e
    } finally {
      pgClient.release()
    }
  }

  public async saveAnswer(answer: Answer): Promise<void> {
    const pgClient = await this.pgPool.connect()

    const query =
      "INSERT INTO Chatitems (id, type, roomid, topicid, iconid, timestamp, createdat, content, targetid) " +
      "VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)"
    const type: ChatItemType = "answer"

    try {
      await pgClient.query(query, [
        answer.id,
        type,
        answer.roomId,
        answer.topicId,
        answer.userIconId,
        answer.timestamp,
        ChatItemRepository.formatDate(answer.createdAt),
        answer.content,
        answer.target.id,
      ])
    } catch (e) {
      console.error(
        `${e.message ?? "Unknown error."} (SAVE ROOM/TOPIC IN DB)`,
        new Date().toISOString(),
      )
      throw e
    } finally {
      pgClient.release()
    }
  }

  // NOTE: arrow functionにしないとthisの挙動のせいでバグる
  public find = async (chatItemId: string): Promise<ChatItem> => {
    const pgClient = await this.pgPool.connect()

    const query = "SELECT * FROM chatitems WHERE id = $1"
    const res = await pgClient
      .query(query, [chatItemId])
      .finally(pgClient.release)
    const row = res.rows[0]

    return await this.buildChatItem(row)
  }

  public async selectByRoomId(roomId: string): Promise<ChatItem[]> {
    const pgClient = await this.pgPool.connect()

    const query = "SELECT * FROM chatitems WHERE roomid = $1"
    const res = await pgClient.query(query, [roomId]).finally(pgClient.release)
    const rows = res.rows

    return Promise.all(rows.map(this.buildChatItem))
  }

  // NOTE: arrow functionにしないとthisの挙動のせいでバグる
  private buildChatItem = async (row: any) => {
    // ChatItemモデルのtopicIdの型がstringなので、DB上ではINTで保存しているtopicIdをキャストする
    const topicId = `${row.topicid}`

    // NOTE: 複数回クエリを発行するとパフォーマンスの低下につながるので、一回のクエリでとってこれるならそうしたい
    switch (row.type) {
      case "message": {
        const target =
          row.targetid !== null
            ? ((await this.find(row.targetid)) as Message | Answer)
            : null
        return new Message(
          row.id,
          topicId,
          row.roomid,
          row.iconid,
          row.createdat,
          row.content,
          target,
          row.timestamp,
        )
      }
      case "reaction": {
        const target = (await this.find(row.targetid)) as
          | Message
          | Question
          | Answer
        return new Reaction(
          row.id,
          topicId,
          row.roomid,
          row.iconid,
          row.createdat,
          target,
          row.timestamp,
        )
      }
      case "question": {
        return new Question(
          row.id,
          topicId,
          row.roomid,
          row.iconid,
          row.createdat,
          row.content,
          row.timestamp,
        )
      }
      case "answer": {
        const target = (await this.find(row.targetid)) as Question
        return new Answer(
          row.id,
          topicId,
          row.roomid,
          row.iconid,
          row.createdat,
          row.content,
          target,
          row.timestamp,
        )
      }
      default: {
        throw new Error(`row.type(${row.type}) is invalid.`)
      }
    }
  }

  private static formatDate(date: Date): string {
    return date.toISOString().replace(/T/, " ").replace(/\..+/, "")
  }
}

export default ChatItemRepository
