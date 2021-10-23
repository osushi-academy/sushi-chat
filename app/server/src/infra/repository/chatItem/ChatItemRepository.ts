import IChatItemRepository from "../../../domain/chatItem/IChatItemRepository"
import Message from "../../../domain/chatItem/Message"
import Reaction from "../../../domain/chatItem/Reaction"
import Question from "../../../domain/chatItem/Question"
import Answer from "../../../domain/chatItem/Answer"
import ChatItem from "../../../domain/chatItem/ChatItem"
import PGPool from "../PGPool"
import { ChatItemSenderType, ChatItemType } from "sushi-chat-shared"
import { formatDate } from "../../../utils/date"
import User from "../../../domain/user/User"

class ChatItemRepository implements IChatItemRepository {
  constructor(private readonly pgPool: PGPool) {}

  public async saveMessage(message: Message) {
    const pgClient = await this.pgPool.client()

    const query =
      "INSERT INTO chat_items (id, room_id, topic_id, user_id, chat_item_type_id, sender_type_id, quote_id, content, timestamp, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)"

    try {
      await pgClient.query(query, [
        message.id,
        message.user.roomId,
        message.topicId,
        message.user.id,
        ChatItemRepository.chatItemTypeMap["message"],
        ChatItemRepository.senderTypeMap[message.senderType],
        message.quote?.id,
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
        reaction.user.roomId,
        reaction.topicId,
        reaction.user.id,
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
      "INSERT INTO chat_items (id, room_id, topic_id, user_id, chat_item_type_id, sender_type_id, quote_id, content, timestamp, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)"

    try {
      await pgClient.query(query, [
        question.id,
        question.user.roomId,
        question.topicId,
        question.user.id,
        ChatItemRepository.chatItemTypeMap["question"],
        ChatItemRepository.senderTypeMap[question.senderType],
        question.quote?.id,
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
        answer.user.roomId,
        answer.topicId,
        answer.user.id,
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
  public find = async (chatItemId: string): Promise<ChatItem | null> => {
    const pgClient = await this.pgPool.client()

    const query =
      "SELECT " +
      "ci.id, ci.room_id, ci.topic_id, ci.user_id, ci.chat_item_type_id, ci.sender_type_id, ci.quote_id, ci.content, ci.timestamp, ci.created_at, " +
      "u.icon_id, u.is_admin, u.is_system, u.has_left, " +
      "q.id AS quote_id, q.room_id AS quote_room_id, q.topic_id AS quote_topic_id, q.user_id AS quote_user_id, q.chat_item_type_id AS quote_type_id, q.sender_type_id AS quote_sender_type_id, q.content AS quote_content, q.timestamp AS quote_timestamp, q.created_at AS quote_created_at, " +
      "qu.icon_id AS quote_icon_id, qu.is_admin AS quote_is_admin, qu.is_system AS quote_is_system, qu.has_left AS quote_has_left " +
      "FROM chat_items as ci " +
      "JOIN users u ON ci.user_id = u.id AND ci.id = $1 " +
      "LEFT JOIN chat_items q ON ci.quote_id = q.id " +
      "LEFT JOIN users qu ON q.user_id = qu.id"

    try {
      const res = await pgClient.query(query, [chatItemId])
      if (res.rowCount < 1) return null

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

    const query =
      "SELECT " +
      "ci.id, ci.room_id, ci.topic_id, ci.user_id, ci.chat_item_type_id, ci.sender_type_id, ci.quote_id, ci.content, ci.timestamp, ci.created_at, " +
      "u.icon_id, u.is_admin, u.is_system, u.has_left, " +
      "q.id AS quote_id, q.room_id AS quote_room_id, q.topic_id AS quote_topic_id, q.user_id AS quote_user_id, q.chat_item_type_id AS quote_type_id, q.sender_type_id AS quote_sender_type_id, q.content AS quote_content, q.timestamp AS quote_timestamp, q.created_at AS quote_created_at, " +
      "qu.icon_id AS quote_icon_id, qu.is_admin AS quote_is_admin, qu.is_system AS quote_is_system, qu.has_left AS quote_has_left " +
      "FROM chat_items ci " +
      "JOIN users u ON ci.user_id = u.id AND ci.room_id = $1 " +
      "LEFT JOIN chat_items q ON ci.quote_id = q.id " +
      "LEFT JOIN users qu ON q.user_id = qu.id " +
      "ORDER BY ci.created_at"

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

  public async pinChatItem(chatItem: ChatItem) {
    const pgClient = await this.pgPool.client()

    const query =
      "INSERT INTO topics_pinned_chat_items (room_id, topic_id, chat_item_id) VALUES ($1,$2, $3)"
    try {
      await pgClient.query(query, [
        chatItem.user.roomId,
        chatItem.topicId,
        chatItem.id,
      ])
    } catch (e) {
      ChatItemRepository.logError(e, "pinChatItem()")
      throw e
    } finally {
      pgClient.release()
    }
  }

  // NOTE: arrow functionにしないとthisの挙動のせいでバグる
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private buildChatItem(row: any) {
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
    const iconId = row.icon_id
    const isAdmin = row.is_admin
    const isSystem = row.is_system
    const user = new User(userId, isAdmin, isSystem, roomId, iconId)

    let quote: ChatItem | null = null
    if (row.quote_id) {
      const quoteId = row.quote_id
      const quoteRoomId = row.quote_room_id
      const quoteTopicId = row.quote_topic_id
      const quoteUserId = row.quote_user_id
      const quoteTypeId = ChatItemRepository.intToChatItemType(
        row.quote_type_id,
      )
      const quoteSenderType = ChatItemRepository.intToSenderType(
        row.quote_sender_type_id,
      )
      const quoteContent = row.quote_content
      const quoteTimestamp = row.quote_timestamp
      const quoteCreatedAt = row.quote_created_at
      const quoteIconId = row.quote_icon_id
      const quoteIsAdmin = row.quote_is_admin
      const quoteIsSystem = row.quote_is_system
      const quoteUser = new User(
        quoteUserId,
        quoteIsAdmin,
        quoteIsSystem,
        quoteRoomId,
        quoteIconId,
      )

      switch (quoteTypeId) {
        case "message":
          quote = new Message(
            quoteId,
            quoteTopicId,
            quoteUser,
            quoteSenderType,
            quoteContent,
            null,
            quoteCreatedAt,
            quoteTimestamp,
          )
          break

        case "question":
          quote = new Question(
            quoteId,
            quoteTopicId,
            quoteUser,
            quoteSenderType,
            quoteContent,
            null,
            quoteCreatedAt,
            quoteTimestamp,
          )
          break

        case "answer":
          quote = new Answer(
            quoteId,
            quoteTopicId,
            quoteUser,
            quoteSenderType,
            quoteContent,
            null,
            quoteCreatedAt,
            quoteTimestamp,
          )
          break

        default:
          // "Reaction"がquoteになることもないので、その場合もここにくる
          throw Error(`Invalid quote type: ${quoteTypeId}`)
      }
    }

    // NOTE: 複数回クエリを発行するとパフォーマンスの低下につながるので、一回のクエリでとってこれるならそうしたい
    switch (chatItemType) {
      case "message":
        return new Message(
          id,
          topicId,
          user,
          senderType,
          row.content,
          quote as Message | Answer | null,
          createdAt,
          timestamp,
        )

      case "reaction":
        return new Reaction(
          id,
          topicId,
          user,
          senderType,
          quote as Message | Question | Answer,
          createdAt,
          timestamp,
        )

      case "question":
        return new Question(
          id,
          topicId,
          user,
          senderType,
          row.content,
          quote as Message | Answer | null,
          createdAt,
          timestamp,
        )

      case "answer":
        return new Answer(
          id,
          topicId,
          user,
          senderType,
          row.content,
          quote as Question,
          createdAt,
          timestamp,
        )

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
