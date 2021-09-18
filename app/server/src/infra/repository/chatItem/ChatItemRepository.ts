import IChatItemRepository from "../../../domain/chatItem/IChatItemRepository"
import Message from "../../../domain/chatItem/Message"
import Reaction from "../../../domain/chatItem/Reaction"
import Question from "../../../domain/chatItem/Question"
import Answer from "../../../domain/chatItem/Answer"
import ChatItem from "../../../domain/chatItem/ChatItem"
import PGPool from "../PGPool"
import { ChatItemSenderType, ChatItemType } from "sushi-chat-shared"
import { formatDate } from "../../../utils/date"

class ChatItemRepository implements IChatItemRepository {
  constructor(private readonly pgPool: PGPool) {}

  public async saveMessage(message: Message) {
    const pgClient = await this.pgPool.client()

    const query =
      "INSERT INTO chat_items (id, room_id, topic_id, user_id, chat_item_type_id, sender_type_id, quote_id, content, timestamp, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)"

    try {
      await pgClient.query(query, [
        message.id,
        message.roomId,
        message.topicId,
        message.iconId,
        ChatItemRepository.chatItemTypeMap["message"],
        ChatItemRepository.senderTypeMap[message.senderType],
        message.quote ? message.quote.id : null,
        message.content,
        message.timestamp,
        formatDate(message.createdAt),
      ])
    } catch (e) {
      ChatItemRepository.logError(e, "saveMessage()")
      throw e
    } finally {
      pgClient.release()
    }
  }

  public async saveReaction(reaction: Reaction) {
    const pgClient = await this.pgPool.client()

    const query =
      "INSERT INTO chat_items (id, room_id, topic_id, user_id, chat_item_type_id, sender_type_id, quote_id, content, timestamp, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7, NULL, $8, $9)"

    try {
      await pgClient.query(query, [
        reaction.id,
        reaction.roomId,
        reaction.topicId,
        reaction.iconId,
        ChatItemRepository.chatItemTypeMap["reaction"],
        ChatItemRepository.senderTypeMap[reaction.senderType],
        reaction.quote.id,
        reaction.timestamp,
        formatDate(reaction.createdAt),
      ])
    } catch (e) {
      ChatItemRepository.logError(e, "saveReaction()")
      throw e
    } finally {
      pgClient.release()
    }
  }

  public async saveQuestion(question: Question) {
    const pgClient = await this.pgPool.client()

    const query =
      "INSERT INTO chat_items (id, room_id, topic_id, user_id, chat_item_type_id, sender_type_id, quote_id, content, timestamp, created_at) VALUES ($1, $2, $3, $4, $5, $6, NULL, $7, $8, $9)"

    try {
      await pgClient.query(query, [
        question.id,
        question.roomId,
        question.topicId,
        question.iconId,
        ChatItemRepository.chatItemTypeMap["question"],
        ChatItemRepository.senderTypeMap[question.senderType],
        question.content,
        question.timestamp,
        formatDate(question.createdAt),
      ])
    } catch (e) {
      ChatItemRepository.logError(e, "saveQuestion()")
      throw e
    } finally {
      pgClient.release()
    }
  }

  public async saveAnswer(answer: Answer) {
    const pgClient = await this.pgPool.client()

    const query =
      "INSERT INTO chat_items (id, room_id, topic_id, user_id, chat_item_type_id, sender_type_id, quote_id, content, timestamp, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)"

    try {
      await pgClient.query(query, [
        answer.id,
        answer.roomId,
        answer.topicId,
        answer.iconId,
        ChatItemRepository.chatItemTypeMap["answer"],
        ChatItemRepository.senderTypeMap[answer.senderType],
        answer.quote.id,
        answer.content,
        answer.timestamp,
        formatDate(answer.createdAt),
      ])
    } catch (e) {
      ChatItemRepository.logError(e, "saveAnswer()")
      throw e
    } finally {
      pgClient.release()
    }
  }

  // NOTE: arrow functionにしないとthisの挙動のせいでバグる
  public find = async (chatItemId: string): Promise<ChatItem> => {
    const pgClient = await this.pgPool.client()

    const query =
      "SELECT id, room_id, topic_id, user_id, chat_item_type_id, sender_type_id, quote_id, content, timestamp, created_at FROM chat_items WHERE id = $1"
    try {
      const res = await pgClient.query(query, [chatItemId])
      return await this.buildChatItem(res.rows[0])
    } catch (e) {
      ChatItemRepository.logError(e, "find()")
      throw e
    } finally {
      pgClient.release()
    }
  }

  public async selectByRoomId(roomId: string): Promise<ChatItem[]> {
    const pgClient = await this.pgPool.client()

    const query = "SELECT * FROM chat_items WHERE room_id = $1"
    try {
      const res = await pgClient.query(query, [roomId])
      return Promise.all(res.rows.map(this.buildChatItem))
    } catch (e) {
      ChatItemRepository.logError(e, "selectByRoomId()")
      throw e
    } finally {
      pgClient.release()
    }
  }

  // NOTE: arrow functionにしないとthisの挙動のせいでバグる
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private buildChatItem = async (row: any) => {
    const id = row.id
    const roomId = row.room_id
    const topicId = row.topic_id
    const userId = row.user_id
    const chatItemType = ChatItemRepository.intToChatItemType(
      row.chat_item_type_id,
    )
    const senderType = ChatItemRepository.intToSenderType(row.sender_type_id)
    const timestamp = row.timestamp
    const createdAt = row.created_at

    // NOTE: 複数回クエリを発行するとパフォーマンスの低下につながるので、一回のクエリでとってこれるならそうしたい
    switch (chatItemType) {
      case "message": {
        const quoteId = row.quote_id
        const quote =
          quoteId !== null
            ? ((await this.find(quoteId)) as Message | Answer)
            : null

        return new Message(
          id,
          roomId,
          topicId,
          userId,
          senderType,
          row.content,
          quote,
          createdAt,
          timestamp,
        )
      }
      case "reaction": {
        const quote = (await this.find(row.quote_id)) as
          | Message
          | Question
          | Answer

        return new Reaction(
          id,
          roomId,
          topicId,
          userId,
          senderType,
          quote,
          createdAt,
          timestamp,
        )
      }
      case "question": {
        return new Question(
          id,
          roomId,
          topicId,
          userId,
          senderType,
          row.content,
          createdAt,
          timestamp,
        )
      }
      case "answer": {
        const quote = (await this.find(row.targetid)) as Question

        return new Answer(
          id,
          roomId,
          topicId,
          userId,
          senderType,
          row.content,
          quote,
          createdAt,
          timestamp,
        )
      }
      default: {
        throw new Error(`chatItemType(${chatItemType}) is invalid.`)
      }
    }
  }

  private static chatItemTypeMap: Record<ChatItemType, number> = {
    message: 1,
    reaction: 2,
    question: 3,
    answer: 4,
  }

  private static intToChatItemType(n: number): ChatItemType {
    for (const [k, v] of Object.entries(ChatItemRepository.chatItemTypeMap)) {
      if (v === n) return k as ChatItemType
    }

    throw new Error(`${n} is not assigned chat-item-type int.`)
  }

  private static senderTypeMap = {
    general: 1,
    admin: 2,
    speaker: 3,
    system: 4,
  }

  private static intToSenderType(n: number): ChatItemSenderType {
    for (const [k, v] of Object.entries(ChatItemRepository.senderTypeMap)) {
      if (v === n) return k as ChatItemSenderType
    }

    throw new Error(`${n} is not assigned sender-type int.`)
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private static logError(error: any, context: string) {
    const datetime = new Date().toISOString()
    console.error(
      `[${datetime}] ChatItemRepository.${context}: ${
        error ?? "Unknown error."
      }`,
    )
  }
}

export default ChatItemRepository
