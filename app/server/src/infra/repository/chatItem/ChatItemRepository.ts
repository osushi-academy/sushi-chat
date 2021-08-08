import IChatItemRepository from "../../../domain/chatItem/IChatItemRepository"
import PGClientFactory from "../../factory/PGClientFactory"
import Message from "../../../domain/chatItem/Message"
import Reaction from "../../../domain/chatItem/Reaction"
import Question from "../../../domain/chatItem/Question"
import Answer from "../../../domain/chatItem/Answer"
import ChatItem from "../../../domain/chatItem/ChatItem"

class ChatItemRepository implements IChatItemRepository {
  private readonly pgClient = PGClientFactory.create()

  public async saveMessage(message: Message): Promise<void> {
    const m = message.toChatItemStore()
    const query =
      "INSERT INTO Chatitems (id, type, roomid, topicid, iconid, timestamp, createdat, content, targetid) " +
      "VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)"

    try {
      await this.pgClient.query(query, [
        m.id,
        m.type,
        message.roomId,
        m.topicId,
        m.iconId,
        m.timestamp,
        ChatItemRepository.formatDate(m.createdAt),
        m.content,
        m.target,
      ])
    } catch (e) {
      console.error(
        `${e.message ?? "Unknown error."} (SAVE ROOM/TOPIC IN DB)`,
        new Date().toISOString(),
      )
      throw e
    }
  }

  public async saveReaction(reaction: Reaction): Promise<void> {
    const r = reaction.toChatItemStore()
    const query =
      "INSERT INTO Chatitems (id, type, roomid, topicid, iconid, timestamp, createdat, content, targetid) " +
      "VALUES ($1, $2, $3, $4, $5, $6, $7, NULL, $8)"

    try {
      await this.pgClient.query(query, [
        r.id,
        r.type,
        reaction.roomId,
        r.topicId,
        r.iconId,
        r.timestamp,
        ChatItemRepository.formatDate(r.createdAt),
        r.target,
      ])
    } catch (e) {
      console.log(
        `${e.message ?? "Unknown error."} (SAVE ROOM/TOPIC IN DB)`,
        new Date().toISOString(),
      )

      throw e
    }
  }

  public async saveQuestion(question: Question): Promise<void> {
    const q = question.toChatItemStore()
    const query =
      "INSERT INTO Chatitems (id, type, roomid, topicid, iconid, timestamp, createdat, content, targetid) " +
      "VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NULL)"

    try {
      await this.pgClient.query(query, [
        q.id,
        q.type,
        question.roomId,
        q.topicId,
        q.iconId,
        q.timestamp,
        ChatItemRepository.formatDate(q.createdAt),
        q.content,
      ])
    } catch (e) {
      console.log(
        `${e.message ?? "Unknown error."} (SAVE ROOM/TOPIC IN DB)`,
        new Date().toISOString(),
      )

      throw e
    }
  }

  public async saveAnswer(answer: Answer): Promise<void> {
    const a = answer.toChatItemStore()
    const query =
      "INSERT INTO Chatitems (id, type, roomid, topicid, iconid, timestamp, createdat, content, targetid) " +
      "VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)"

    try {
      await this.pgClient.query(query, [
        a.id,
        a.type,
        answer.roomId,
        a.topicId,
        a.iconId,
        a.timestamp,
        ChatItemRepository.formatDate(a.createdAt),
        a.content,
        a.target,
      ])
    } catch (e) {
      console.error(
        `${e.message ?? "Unknown error."} (SAVE ROOM/TOPIC IN DB)`,
        new Date().toISOString(),
      )

      throw e
    }
  }

  public async find(chatItemId: string): Promise<ChatItem> {
    const query = "SELECT * FROM chatitems WHERE id = $1"
    const res = (await this.pgClient.query(query, [chatItemId])).rows[0]

    // NOTE: 複数回クエリを発行するとパフォーマンスの低下につながるので、一回のクエリでとってこれるならそうしたい
    let target = null
    switch (res.type) {
      case "message":
        if (res.targetid !== null) {
          target = (await this.find(res.targetid)) as Message | Answer
        }
        return new Message(
          res.id,
          res.topicid,
          res.roomid,
          res.iconid,
          res.timestamp,
          res.createdat,
          res.content,
          target,
        )
      case "reaction":
        target = (await this.find(res.targetid)) as Message | Question | Answer
        return new Reaction(
          res.id,
          res.topicid,
          res.roomid,
          res.iconid,
          res.timestamp,
          res.createdat,
          target,
        )
      case "question":
        return new Question(
          res.id,
          res.topicid,
          res.roomid,
          res.iconid,
          res.timestamp,
          res.createdat,
          res.content,
        )
      case "answer":
        target = (await this.find(res.targetid)) as Question
        return new Answer(
          res.id,
          res.topicid,
          res.roomid,
          res.iconid,
          res.timestamp,
          res.createdat,
          res.content,
          target,
        )
      default:
        throw new Error(
          `ChatItemId(id: ${chatItemId}) was not found. (FIND ROOM)`,
        )
    }
  }

  private static formatDate(date: Date): string {
    return date.toISOString().replace(/T/, " ").replace(/\..+/, "")
  }
}

export default ChatItemRepository
