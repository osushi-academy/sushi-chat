import { v4 as uuid } from "uuid"
import ChatItem from "../domain/chatItem/ChatItem"
import ChatItemService from "../service/chatItem/ChatItemService"
import IChatItemRepository from "../domain/chatItem/IChatItemRepository"
import EphemeralRoomRepository from "../infra/repository/room/EphemeralRoomRepository"
import EphemeralChatItemRepository from "../infra/repository/chatItem/EphemeralChatItemRepository"
import EphemeralUserRepository from "../infra/repository/User/EphemeralUserRepository"
import EphemeralChatItemDelivery from "../infra/delivery/chatItem/EphemeralChatItemDelivery"
import EphemeralAdminRepository from "../infra/repository/admin/EphemeralAdminRepository"
import RoomClass from "../domain/room/Room"
import Admin from "../domain/admin/admin"
import User from "../domain/user/User"
import { NewIconId } from "../domain/user/IconId"
import { ChatItemSenderType } from "sushi-chat-shared"
import Message from "../domain/chatItem/Message"
import Reaction from "../domain/chatItem/Reaction"
import Question from "../domain/chatItem/Question"
import Answer from "../domain/chatItem/Answer"

// TODO: 各chatItemのinstance typeごとに、全chatItemのinstance typeをtargetにしたテストをする
describe("ChatItemServiceのテスト", () => {
  let userId: string
  let roomId: string
  let target: Message

  // 短文
  const content = "親譲りの無鉄砲で小供の時から損ばかりしている。"

  // 300文字
  const longLimitContent =
    "親譲りの無鉄砲で小供の時から損ばかりしている。小学校に居る時分学校の二階から飛び降りて一週間ほど腰を抜かした事がある。なぜそんな無闇をしたと聞く人があるかも知れぬ。別段深い理由でもない。新築の二階から首を出していたら、同級生の一人が冗談に、いくら威張っても、そこから飛び降りる事は出来まい。弱虫やーい。と囃したからである。小使に負ぶさって帰って来た時、おやじが大きな眼をして二階ぐらいから飛び降りて腰を抜かす奴があるかと云ったから、この次は抜かさずに飛んで見せますと答えた。（青空文庫より）親譲りの無鉄砲で小供の時から損ばかりしている。小学校に居る時分学校の二階から飛び降りて一週間ほど腰を抜かした🤷‍♂️"

  // 301文字
  const unacceptableLongContent =
    "親譲りの無鉄砲で小供の時から損ばかりしている。小学校に居る時分学校の二階から飛び降りて一週間ほど腰を抜かした事がある。なぜそんな無闇をしたと聞く人があるかも知れぬ。別段深い理由でもない。新築の二階から首を出していたら、同級生の一人が冗談に、いくら威張っても、そこから飛び降りる事は出来まい。弱虫やーい。と囃したからである。小使に負ぶさって帰って来た時、おやじが大きな眼をして二階ぐらいから飛び降りて腰を抜かす奴があるかと云ったから、この次は抜かさずに飛んで見せますと答えた。（青空文庫より）親譲りの無鉄砲で小供の時から損ばかりしている。小学校に居る時分学校の二階から飛び降りて一週間ほど腰を抜かした事🤷‍♂️"

  let chatItemRepository: IChatItemRepository
  let chatItemDeliverySubscriber: {
    type: "post" | "pin"
    chatItem: ChatItem
  }[]
  let chatItemService: ChatItemService

  beforeEach(async () => {
    const adminRepository = new EphemeralAdminRepository()
    const roomRepository = new EphemeralRoomRepository(adminRepository)
    const userRepository = new EphemeralUserRepository()
    chatItemRepository = new EphemeralChatItemRepository()

    chatItemDeliverySubscriber = []
    const chatItemDelivery = new EphemeralChatItemDelivery([
      chatItemDeliverySubscriber,
    ])
    chatItemService = new ChatItemService(
      chatItemRepository,
      roomRepository,
      userRepository,
      chatItemDelivery,
    )

    const admin = new Admin(uuid(), "Admin", [])
    adminRepository.createIfNotExist(admin)

    roomId = uuid()
    userId = uuid()
    const user = new User(userId, false, false, roomId, NewIconId(1))
    userRepository.create(user)

    const targetUser = new User(uuid(), false, false, roomId, NewIconId(2))
    userRepository.create(targetUser)

    // chatItemを投稿するroomを作成しておく
    roomRepository.build(
      new RoomClass(
        roomId,
        "test room",
        uuid(),
        "This is test room.",
        [{ title: "test topic" }],
        new Set([admin.id]),
        "ongoing",
        new Date(),
        { 1: { openedDate: Date.now(), pausedDate: null, offsetTime: 0 } },
        null,
        null,
        new Set([userId, targetUser.id]),
      ),
    )

    target = new Message(
      uuid(),
      1,
      targetUser,
      "general",
      "ターゲットメッセージ",
      null,
      new Date(),
      0,
    )
    chatItemRepository.saveMessage(target)
  })

  describe("postMessageのテスト", () => {
    test("正常系_quoteがないmessageを投稿", async () => {
      const messageId = uuid()
      await chatItemService.postMessage({
        chatItemId: messageId,
        userId,
        topicId: 1,
        content: content,
        quoteId: null,
      })

      const message = (await chatItemRepository.find(messageId)) as Message
      if (!message) {
        throw new Error(`ChatItem(${messageId}) was not found.`)
      }

      expect(message.id).toBe(messageId)
      expect(message.topicId).toBe(1)
      expect(message.user.id).toBe(userId)
      expect(message.senderType).toBe<ChatItemSenderType>("general")
      expect(message.timestamp).not.toBeNull()
      expect(message.isPinned).toBeFalsy()
      expect(message.content).toBe(content)
      expect(message.quote).toBeNull()

      const delivered = chatItemDeliverySubscriber[0]
      expect(delivered.type).toBe("post")
      const deliveredMessage = delivered.chatItem as Message
      expect(deliveredMessage.id).toBe(messageId)
      expect(deliveredMessage.topicId).toBe(1)
      expect(deliveredMessage.user.id).toBe(userId)
      expect(deliveredMessage.senderType).toBe<ChatItemSenderType>("general")
      expect(deliveredMessage.timestamp).not.toBeNull()
      expect(deliveredMessage.isPinned).toBeFalsy()
      expect(deliveredMessage.content).toBe(content)
      expect(deliveredMessage.quote).toBeNull()
    })

    test("正常系_絵文字込み300文字でquoteがあるmessageを投稿", async () => {
      const messageId = uuid()
      await chatItemService.postMessage({
        chatItemId: messageId,
        userId,
        topicId: 1,
        content: longLimitContent,
        quoteId: target.id,
      })

      const message = (await chatItemRepository.find(messageId)) as Message
      if (!message) {
        throw new Error(`ChatItem(${messageId}) was not found.`)
      }

      expect(message.id).toBe(messageId)
      expect(message.topicId).toBe(1)
      expect(message.user.id).toBe(userId)
      expect(message.senderType).toBe<ChatItemSenderType>("general")
      expect(message.timestamp).not.toBeNull()
      expect(message.isPinned).toBeFalsy()
      expect(message.content).toBe(longLimitContent)
      expect(message.quote?.id).toBe(target.id)

      const delivered = chatItemDeliverySubscriber[0]
      expect(delivered.type).toBe("post")
      const deliveredMessage = delivered.chatItem as Message
      expect(deliveredMessage.id).toBe(messageId)
      expect(deliveredMessage.topicId).toBe(1)
      expect(deliveredMessage.user.id).toBe(userId)
      expect(deliveredMessage.senderType).toBe<ChatItemSenderType>("general")
      expect(deliveredMessage.timestamp).not.toBeNull()
      expect(deliveredMessage.isPinned).toBeFalsy()
      expect(deliveredMessage.content).toBe(longLimitContent)
      expect(deliveredMessage.quote?.id).toBe(target.id)
    })

    test("異常系_絵文字込みで300文字を超えるmessageを投稿", async () => {
      const messageId = uuid()
      await expect(() =>
        chatItemService.postMessage({
          chatItemId: messageId,
          userId,
          topicId: 1,
          content: unacceptableLongContent,
          quoteId: null,
        }),
      ).rejects.toThrowError()
    })
  })

  describe("postReactionのテスト", () => {
    test("正常系_reactionを投稿", async () => {
      const reactionId = uuid()
      await chatItemService.postReaction({
        chatItemId: reactionId,
        userId,
        topicId: 1,
        quoteId: target.id,
      })

      const reaction = (await chatItemRepository.find(reactionId)) as Reaction
      if (!reaction) {
        throw new Error(`Reaction(${reactionId}) was not found.`)
      }

      expect(reaction.id).toBe(reactionId)
      expect(reaction.topicId).toBe(1)
      expect(reaction.user.id).toBe(userId)
      expect(reaction.senderType).toBe<ChatItemSenderType>("general")
      expect(reaction.timestamp).not.toBeNull()
      expect(reaction.isPinned).toBeFalsy()
      expect(reaction.quote?.id).toBe(target.id)

      const delivered = chatItemDeliverySubscriber[0]
      expect(delivered.type).toBe("post")
      const deliveredReaction = delivered.chatItem as Reaction
      expect(deliveredReaction.id).toBe(reactionId)
      expect(deliveredReaction.topicId).toBe(1)
      expect(deliveredReaction.user.id).toBe(userId)
      expect(deliveredReaction.senderType).toBe<ChatItemSenderType>("general")
      expect(deliveredReaction.timestamp).not.toBeNull()
      expect(deliveredReaction.isPinned).toBeFalsy()
      expect(deliveredReaction.quote?.id).toBe(target.id)
    })
  })

  describe("postQuestionのテスト", () => {
    test("正常系_questionを投稿", async () => {
      const questionId = uuid()
      await chatItemService.postQuestion({
        chatItemId: questionId,
        content: content,
        userId,
        topicId: 1,
        quoteId: null,
      })

      const question = (await chatItemRepository.find(questionId)) as Question
      if (!question) {
        throw new Error(`Question(${questionId}) was not found.`)
      }

      expect(question.id).toBe(questionId)
      expect(question.topicId).toBe(1)
      expect(question.user.id).toBe(userId)
      expect(question.senderType).toBe<ChatItemSenderType>("general")
      expect(question.timestamp).not.toBeNull()
      expect(question.isPinned).toBeFalsy()
      expect(question.content).toBe(content)

      const delivered = chatItemDeliverySubscriber[0]
      expect(delivered.type).toBe("post")
      const deliveredQuestion = delivered.chatItem as Question
      expect(deliveredQuestion.id).toBe(questionId)
      expect(deliveredQuestion.topicId).toBe(1)
      expect(deliveredQuestion.user.id).toBe(userId)
      expect(deliveredQuestion.senderType).toBe<ChatItemSenderType>("general")
      expect(deliveredQuestion.timestamp).not.toBeNull()
      expect(deliveredQuestion.isPinned).toBeFalsy()
      expect(deliveredQuestion.content).toBe(content)
    })

    test("正常系_絵文字込み300文字のquestionを投稿", async () => {
      const questionId = uuid()
      await chatItemService.postQuestion({
        chatItemId: questionId,
        content: longLimitContent,
        userId,
        topicId: 1,
        quoteId: null,
      })

      const question = (await chatItemRepository.find(questionId)) as Question
      if (!question) {
        throw new Error(`Question(${questionId}) was not found.`)
      }

      expect(question.id).toBe(questionId)
      expect(question.topicId).toBe(1)
      expect(question.user.id).toBe(userId)
      expect(question.senderType).toBe<ChatItemSenderType>("general")
      expect(question.timestamp).not.toBeNull()
      expect(question.isPinned).toBeFalsy()
      expect(question.content).toBe(longLimitContent)

      const delivered = chatItemDeliverySubscriber[0]
      expect(delivered.type).toBe("post")
      const deliveredQuestion = delivered.chatItem as Question
      expect(deliveredQuestion.id).toBe(questionId)
      expect(deliveredQuestion.topicId).toBe(1)
      expect(deliveredQuestion.user.id).toBe(userId)
      expect(deliveredQuestion.senderType).toBe<ChatItemSenderType>("general")
      expect(deliveredQuestion.timestamp).not.toBeNull()
      expect(deliveredQuestion.isPinned).toBeFalsy()
      expect(deliveredQuestion.content).toBe(longLimitContent)
    })

    test("異常系_300文字を超えるquestionを投稿", async () => {
      const messageId = uuid()
      await expect(() =>
        chatItemService.postQuestion({
          chatItemId: messageId,
          userId,
          topicId: 1,
          content: unacceptableLongContent,
          quoteId: null,
        }),
      ).rejects.toThrowError()
    })
  })

  describe("postAnswerのテスト", () => {
    test("正常系_絵文字込み300文字のanserが投稿される", async () => {
      const answerId = uuid()
      await chatItemService.postMessage({
        chatItemId: answerId,
        userId,
        topicId: 1,
        content: content,
        quoteId: target.id,
      })

      const answer = (await chatItemRepository.find(answerId)) as Answer
      if (!answer) {
        throw new Error(`ChatItem(${answerId}) was not found.`)
      }

      expect(answer.id).toBe(answerId)
      expect(answer.topicId).toBe(1)
      expect(answer.user.id).toBe(userId)
      expect(answer.senderType).toBe<ChatItemSenderType>("general")
      expect(answer.timestamp).not.toBeNull()
      expect(answer.isPinned).toBeFalsy()
      expect(answer.content).toBe(content)
      expect((answer.quote as Question).id).toBe(target.id)

      const delivered = chatItemDeliverySubscriber[0]
      expect(delivered.type).toBe("post")
      const deliveredAnswer = delivered.chatItem as Answer
      expect(deliveredAnswer.id).toBe(answerId)
      expect(deliveredAnswer.topicId).toBe(1)
      expect(deliveredAnswer.user.id).toBe(userId)
      expect(deliveredAnswer.senderType).toBe<ChatItemSenderType>("general")
      expect(deliveredAnswer.timestamp).not.toBeNull()
      expect(deliveredAnswer.isPinned).toBeFalsy()
      expect(deliveredAnswer.content).toBe(content)
      expect((deliveredAnswer.quote as Question).id).toBe(target.id)
    })

    test("正常系_絵文字込み300文字のanserが投稿される", async () => {
      const answerId = uuid()
      await chatItemService.postMessage({
        chatItemId: answerId,
        userId,
        topicId: 1,
        content: longLimitContent,
        quoteId: target.id,
      })

      const answer = (await chatItemRepository.find(answerId)) as Answer
      if (!answer) {
        throw new Error(`ChatItem(${answerId}) was not found.`)
      }

      expect(answer.id).toBe(answerId)
      expect(answer.topicId).toBe(1)
      expect(answer.user.id).toBe(userId)
      expect(answer.senderType).toBe<ChatItemSenderType>("general")
      expect(answer.timestamp).not.toBeNull()
      expect(answer.isPinned).toBeFalsy()
      expect(answer.content).toBe(longLimitContent)
      expect((answer.quote as Question).id).toBe(target.id)

      const delivered = chatItemDeliverySubscriber[0]
      expect(delivered.type).toBe("post")
      const deliveredAnswer = delivered.chatItem as Answer
      expect(deliveredAnswer.id).toBe(answerId)
      expect(deliveredAnswer.topicId).toBe(1)
      expect(deliveredAnswer.user.id).toBe(userId)
      expect(deliveredAnswer.senderType).toBe<ChatItemSenderType>("general")
      expect(deliveredAnswer.timestamp).not.toBeNull()
      expect(deliveredAnswer.isPinned).toBeFalsy()
      expect(deliveredAnswer.content).toBe(longLimitContent)
      expect((deliveredAnswer.quote as Question).id).toBe(target.id)
    })

    test("異常系_300文字を超えるanserを投稿", async () => {
      const messageId = uuid()
      await expect(() =>
        chatItemService.postQuestion({
          chatItemId: messageId,
          userId,
          topicId: 1,
          content: unacceptableLongContent,
          quoteId: target.id,
        }),
      ).rejects.toThrowError()
    })
  })

  describe("pinChatItemのテスト", () => {
    test("正常系_chatItemをピン留めする", async () => {
      await chatItemService.pinChatItem({ chatItemId: target.id })

      const pinned = await chatItemRepository.find(target.id)
      expect(pinned?.isPinned).toBeTruthy()
    })
  })
})
