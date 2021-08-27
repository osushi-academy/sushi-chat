import IChatItemRepository from "../../../domain/chatItem/IChatItemRepository"
import PGClientFactory from "../../factory/PGClientFactory"
import Message from "../../../domain/chatItem/Message"
import Reaction from "../../../domain/chatItem/Reaction"
import Question from "../../../domain/chatItem/Question"
import Answer from "../../../domain/chatItem/Answer"
import ChatItem from "../../../domain/chatItem/ChatItem"
import { ChatItemType } from "../../../chatItem"

class ChatItemRepository implements IChatItemRepository {
  private readonly pgClient = PGClientFactory.create()

  public async saveMessage(message: Message): Promise<void> {
    const query =
      "INSERT INTO Chatitems (id, type, roomid, topicid, iconid, timestamp, createdat, content, targetid) " +
      "VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)"

    const type: ChatItemType = "message"
    try {
      await this.pgClient.query(query, [
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
    }
  }

  public async saveReaction(reaction: Reaction): Promise<void> {
    const query =
      "INSERT INTO Chatitems (id, type, roomid, topicid, iconid, timestamp, createdat, content, targetid) " +
      "VALUES ($1, $2, $3, $4, $5, $6, $7, NULL, $8)"

    const type: ChatItemType = "reaction"
    try {
      await this.pgClient.query(query, [
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
    }
  }

  public async saveQuestion(question: Question): Promise<void> {
    const query =
      "INSERT INTO Chatitems (id, type, roomid, topicid, iconid, timestamp, createdat, content, targetid) " +
      "VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NULL)"

    const type: ChatItemType = "question"
    try {
      await this.pgClient.query(query, [
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
    }
  }

  public async saveAnswer(answer: Answer): Promise<void> {
    const query =
      "INSERT INTO Chatitems (id, type, roomid, topicid, iconid, timestamp, createdat, content, targetid) " +
      "VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)"

    const type: ChatItemType = "answer"
    try {
      await this.pgClient.query(query, [
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
    }
  }

  public async find(chatItemId: string): Promise<ChatItem> {
    const query = "SELECT * FROM chatitems WHERE id = $1"
    const res = (await this.pgClient.query(query, [chatItemId])).rows[0]

    const topicId = `${res.topicid}`

    // NOTE: 複数回クエリを発行するとパフォーマンスの低下につながるので、一回のクエリでとってこれるならそうしたい
    let target = null
    switch (res.type) {
      case "message":
        if (res.targetid !== null) {
          target = (await this.find(res.targetid)) as Message | Answer
        }
        return new Message(
          res.id,
          topicId,
          res.roomid,
          res.iconid,
          res.createdat,
          res.content,
          target,
          res.timestamp,
        )
      case "reaction":
        target = (await this.find(res.targetid)) as Message | Question | Answer
        return new Reaction(
          res.id,
          topicId,
          res.roomid,
          res.iconid,
          res.createdat,
          target,
          res.timestamp,
        )
      case "question":
        return new Question(
          res.id,
          topicId,
          res.roomid,
          res.iconid,
          res.createdat,
          res.content,
          res.timestamp,
        )
      case "answer":
        target = (await this.find(res.targetid)) as Question
        return new Answer(
          res.id,
          topicId,
          res.roomid,
          res.iconid,
          res.createdat,
          res.content,
          target,
          res.timestamp,
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
