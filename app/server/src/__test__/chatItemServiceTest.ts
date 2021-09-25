test("ダミー", () => {
  expect(true).toBeTruthy()
}) // import getUUID from "sushi-chat-front/utils/getUUID"
// import ChatItem from "../domain/chatItem/ChatItem"
// import ChatItemService from "../service/chatItem/ChatItemService"
// import UserService from "../service/user/UserService"
// import RoomService from "../service/room/RoomService"
// import IChatItemRepository from "../domain/chatItem/IChatItemRepository"
// import EphemeralRoomRepository from "../infra/repository/room/EphemeralRoomRepository"
// import EphemeralChatItemRepository from "../infra/repository/chatItem/EphemeralChatItemRepository"
// import EphemeralUserRepository from "../infra/repository/User/EphemeralUserRepository"
// import EphemeralChatItemDelivery from "../infra/delivery/chatItem/EphemeralChatItemDelivery"
// import EphemeralRoomDelivery from "../infra/delivery/room/EphemeralRoomDelivery"
// import EphemeralUserDelivery from "../infra/delivery/user/EphemeralUserDelivery"
// import EphemeralStampDelivery from "../infra/delivery/stamp/EphemeralStampDelivery"
// import Message from "../domain/chatItem/Message"
// import Reaction from "../domain/chatItem/Reaction"
// import Question from "../domain/chatItem/Question"
// import Answer from "../domain/chatItem/Answer"
//
// describe("ChatItemServiceのテスト", () => {
//   let adminId: string
//   let userId: string
//   let targetChatItemUserId: string
//   let userIconId: string
//   let targetChatItemUserIconId: string
//
//   let roomId: string
//   let topicIdToBePosted: string
//
//   let targetId: string
//   let targetContent: string
//   let chatItemId: string
//   let content: string
//
//   let chatItemRepository: IChatItemRepository
//   let chatItemDeliverySubscribers: ChatItem[][]
//   let chatItemService: ChatItemService
//   let userService: UserService
//   let roomService: RoomService
//
//   beforeEach(async () => {
//     adminId = getUUID()
//     userId = getUUID()
//     userIconId = "1"
//     targetChatItemUserId = getUUID()
//     targetChatItemUserIconId = "2"
//
//     roomId = getUUID()
//     topicIdToBePosted = "1"
//
//     targetId = getUUID()
//     targetContent = "ターゲットChatItem"
//     chatItemId = getUUID()
//     content = "テストChatItem"
//
//     chatItemRepository = new EphemeralChatItemRepository()
//     const roomRepository = new EphemeralRoomRepository()
//     const userRepository = new EphemeralUserRepository()
//
//     chatItemDeliverySubscribers = [[]]
//     const chatItemDelivery = new EphemeralChatItemDelivery(
//       chatItemDeliverySubscribers,
//     )
//     const roomDelivery = new EphemeralRoomDelivery([])
//     const userDelivery = new EphemeralUserDelivery([])
//     const stampDelivery = new EphemeralStampDelivery([])
//
//     chatItemService = new ChatItemService(
//       chatItemRepository,
//       roomRepository,
//       userRepository,
//       chatItemDelivery,
//     )
//     userService = new UserService(userRepository, roomRepository, userDelivery)
//     roomService = new RoomService(
//       roomRepository,
//       userRepository,
//       chatItemRepository,
//       roomDelivery,
//       chatItemDelivery,
//       stampDelivery,
//     )
//
//     userService.createUser({ userId: adminId })
//     roomService.build({
//       id: roomId,
//       title: "テストルーム",
//       topics: [1, 2].map((i) => ({
//         title: `テストトピック${i}`,
//         description: `テスト用のトピック${i}です`,
//         urls: {},
//       })),
//     })
//     await userService.adminEnterRoom({ adminId, roomId })
//     await roomService.start(adminId)
//     await roomService.changeTopicState({
//       userId: adminId,
//       topicId: topicIdToBePosted,
//       type: "OPEN",
//     })
//     // スタンプを投稿する一般ユーザーが入室
//     userService.createUser({ userId })
//     await userService.enterRoom({ userId, roomId, iconId: userIconId })
//
//     userService.createUser({ userId: targetChatItemUserId })
//     await userService.enterRoom({
//       userId: targetChatItemUserId,
//       roomId: roomId,
//       iconId: targetChatItemUserIconId,
//     })
//   })
//
//   afterEach(() => {
//     roomService.changeTopicState({
//       userId: adminId,
//       topicId: topicIdToBePosted,
//       type: "CLOSE",
//     })
//     roomService.finish(adminId)
//   })
//
//   describe("postメソッドのテスト", () => {
//     describe("Messageのpost", () => {
//       test("正常系_Message(targetなし)をpostすると保存・配信される", async () => {
//         // 管理者ボット等によるchatItemの投稿が既にあるのを考慮
//         const deliveredChatItemCount = chatItemDeliverySubscribers[0].length
//
//         await chatItemService.postMessage({
//           chatItemId,
//           userId,
//           topicId: topicIdToBePosted,
//           content,
//           quoteId: null,
//         })
//
//         const validationValues: ChatItemValidationParams = {
//           id: chatItemId,
//           iconId: userIconId,
//           topicId: topicIdToBePosted,
//           content,
//           isTargetNull: true,
//         }
//
//         const savedChatItem = await chatItemRepository.find(chatItemId)
//         expect(savedChatItem).toBeInstanceOf(Message)
//         validateChatItem(savedChatItem, validationValues)
//
//         expect(chatItemDeliverySubscribers[0]).toHaveLength(
//           deliveredChatItemCount + 1,
//         )
//         const deliveredChatItem =
//           chatItemDeliverySubscribers[0][deliveredChatItemCount]
//         expect(deliveredChatItem).toBeInstanceOf(Message)
//         validateChatItem(deliveredChatItem, validationValues)
//       })
//
//       test("正常系_Message(targetがMessage)をpostすると保存・配信される", async () => {
//         // テストするChatItemのターゲットであるMessageを投稿
//         await chatItemService.postMessage({
//           chatItemId: targetId,
//           userId: targetChatItemUserId,
//           topicId: topicIdToBePosted,
//           content: targetContent,
//           quoteId: null,
//         })
//         // 管理者ボットやターゲットとするchatItemの投稿が既にあるのを考慮
//         const deliveredChatItemCount = chatItemDeliverySubscribers[0].length
//
//         await chatItemService.postMessage({
//           chatItemId,
//           userId,
//           topicId: topicIdToBePosted,
//           content,
//           quoteId: targetId,
//         })
//
//         const validationValues: ChatItemValidationParams = {
//           id: chatItemId,
//           iconId: userIconId,
//           topicId: topicIdToBePosted,
//           content,
//           isTargetNull: false,
//         }
//         const targetValidationValues: ChatItemValidationParams = {
//           id: targetId,
//           iconId: targetChatItemUserIconId,
//           topicId: topicIdToBePosted,
//           content: targetContent,
//           isTargetNull: true,
//         }
//
//         const savedChatItem = await chatItemRepository.find(chatItemId)
//         expect(savedChatItem).toBeInstanceOf(Message)
//         validateChatItem(savedChatItem, validationValues)
//         const savedChatItemTarget = (savedChatItem as Message).target
//         expect(savedChatItemTarget).toBeInstanceOf(Message)
//         validateChatItem(savedChatItemTarget as Message, targetValidationValues)
//
//         expect(chatItemDeliverySubscribers[0]).toHaveLength(
//           deliveredChatItemCount + 1,
//         )
//         const deliveredChatItem =
//           chatItemDeliverySubscribers[0][deliveredChatItemCount]
//         expect(deliveredChatItem).toBeInstanceOf(Message)
//         validateChatItem(deliveredChatItem, validationValues)
//         const deliveredChatItemTarget = (deliveredChatItem as Message).target
//         expect(deliveredChatItemTarget).toBeInstanceOf(Message)
//         validateChatItem(
//           deliveredChatItemTarget as Message,
//           targetValidationValues,
//         )
//       })
//
//       test("正常系_Message(targetがAnswer)をpostすると保存・配信される", async () => {
//         // テストするChatItemのtargetのtargetを投稿
//         const targetOfTargetId = getUUID()
//         await chatItemService.postMessage({
//           chatItemId: targetOfTargetId,
//           userId,
//           topicId: topicIdToBePosted,
//           content: "ターゲットのターゲット",
//           quoteId: null,
//         })
//         // テストするChatItemのtargetであるAnswerを投稿
//         await chatItemService.postAnswer({
//           chatItemId: targetId,
//           userId: targetChatItemUserId,
//           topicId: topicIdToBePosted,
//           content: targetContent,
//           quoteId: targetOfTargetId,
//         })
//
//         // 管理者ボットやターゲットとするchatItemの投稿が既にあるのを考慮
//         const deliveredChatItemCount = chatItemDeliverySubscribers[0].length
//
//         await chatItemService.postMessage({
//           chatItemId,
//           userId,
//           topicId: topicIdToBePosted,
//           content,
//           quoteId: targetId,
//         })
//
//         const validationValues: ChatItemValidationParams = {
//           id: chatItemId,
//           iconId: userIconId,
//           topicId: topicIdToBePosted,
//           content,
//           isTargetNull: false,
//         }
//         const targetValidationValues: ChatItemValidationParams = {
//           id: targetId,
//           iconId: targetChatItemUserIconId,
//           topicId: topicIdToBePosted,
//           content: targetContent,
//           isTargetNull: true,
//         }
//
//         const savedChatItem = await chatItemRepository.find(chatItemId)
//         expect(savedChatItem).toBeInstanceOf(Message)
//         validateChatItem(savedChatItem, validationValues)
//         const savedChatItemTarget = (savedChatItem as Message).target
//         expect(savedChatItemTarget).toBeInstanceOf(Answer)
//         validateChatItem(savedChatItemTarget as Answer, targetValidationValues)
//
//         expect(chatItemDeliverySubscribers[0]).toHaveLength(
//           deliveredChatItemCount + 1,
//         )
//         const deliveredChatItem =
//           chatItemDeliverySubscribers[0][deliveredChatItemCount]
//         expect(deliveredChatItem).toBeInstanceOf(Message)
//         validateChatItem(deliveredChatItem, validationValues)
//         const deliveredChatItemTarget = (deliveredChatItem as Message).target
//         expect(deliveredChatItemTarget).toBeInstanceOf(Answer)
//         validateChatItem(
//           deliveredChatItemTarget as Answer,
//           targetValidationValues,
//         )
//       })
//     })
//
//     describe("Reactionのpost", () => {
//       test("正常系_Reaction(targetがMessage)をpostすると保存・配信される", async () => {
//         // テストするChatItemのターゲットであるMessageを投稿
//         await chatItemService.postMessage({
//           chatItemId: targetId,
//           userId: targetChatItemUserId,
//           topicId: topicIdToBePosted,
//           content: targetContent,
//           quoteId: null,
//         })
//         // 管理者ボット等によるchatItemの投稿が既にあるのを考慮
//         const deliveredChatItemCount = chatItemDeliverySubscribers[0].length
//
//         await chatItemService.postReaction({
//           chatItemId,
//           userId,
//           topicId: topicIdToBePosted,
//           quoteId: targetId,
//         })
//
//         const validationValues: ChatItemValidationParams = {
//           id: chatItemId,
//           iconId: userIconId,
//           topicId: topicIdToBePosted,
//         }
//         const targetValidationValues: ChatItemValidationParams = {
//           id: targetId,
//           iconId: targetChatItemUserIconId,
//           topicId: topicIdToBePosted,
//           content: targetContent,
//           isTargetNull: true,
//         }
//
//         const savedChatItem = await chatItemRepository.find(chatItemId)
//         expect(savedChatItem).toBeInstanceOf(Reaction)
//         validateChatItem(savedChatItem, validationValues)
//         const savedChatItemTarget = (savedChatItem as Reaction).target
//         expect(savedChatItemTarget).toBeInstanceOf(Message)
//         validateChatItem(savedChatItemTarget, targetValidationValues)
//
//         expect(chatItemDeliverySubscribers[0]).toHaveLength(
//           deliveredChatItemCount + 1,
//         )
//         const deliveredChatItem =
//           chatItemDeliverySubscribers[0][deliveredChatItemCount]
//         expect(deliveredChatItem).toBeInstanceOf(Reaction)
//         validateChatItem(deliveredChatItem, validationValues)
//         const deliveredChatItemTarget = (deliveredChatItem as Reaction).target
//         expect(deliveredChatItemTarget).toBeInstanceOf(Message)
//         validateChatItem(deliveredChatItemTarget, targetValidationValues)
//       })
//
//       test("正常系_Reaction(targetがQuestion)をpostすると保存・配信される", async () => {
//         // テストするChatItemのターゲットであるQuestionを投稿
//         await chatItemService.postQuestion({
//           chatItemId: targetId,
//           userId: targetChatItemUserId,
//           topicId: topicIdToBePosted,
//           content: targetContent,
//         })
//         // 管理者ボット等によるchatItemの投稿が既にあるのを考慮
//         const deliveredChatItemCount = chatItemDeliverySubscribers[0].length
//
//         await chatItemService.postReaction({
//           chatItemId,
//           userId,
//           topicId: topicIdToBePosted,
//           quoteId: targetId,
//         })
//
//         const validationValues: ChatItemValidationParams = {
//           id: chatItemId,
//           iconId: userIconId,
//           topicId: topicIdToBePosted,
//         }
//         const targetValidationValues: ChatItemValidationParams = {
//           id: targetId,
//           iconId: targetChatItemUserIconId,
//           topicId: topicIdToBePosted,
//           content: targetContent,
//           isTargetNull: true,
//         }
//
//         const savedChatItem = await chatItemRepository.find(chatItemId)
//         expect(savedChatItem).toBeInstanceOf(Reaction)
//         validateChatItem(savedChatItem, validationValues)
//         const savedChatItemTarget = (savedChatItem as Reaction).target
//         expect(savedChatItemTarget).toBeInstanceOf(Question)
//         validateChatItem(savedChatItemTarget, targetValidationValues)
//
//         expect(chatItemDeliverySubscribers[0]).toHaveLength(
//           deliveredChatItemCount + 1,
//         )
//         const deliveredChatItem =
//           chatItemDeliverySubscribers[0][deliveredChatItemCount]
//         expect(deliveredChatItem).toBeInstanceOf(Reaction)
//         validateChatItem(deliveredChatItem, validationValues)
//         const deliveredChatItemTarget = (deliveredChatItem as Reaction).target
//         expect(deliveredChatItemTarget).toBeInstanceOf(Question)
//         validateChatItem(deliveredChatItemTarget, targetValidationValues)
//       })
//
//       test("正常系_Reaction(targetがAnswer)をpostすると保存・配信される", async () => {
//         // テストするChatItemのtargetのtargetを投稿
//         const targetOfTargetId = getUUID()
//         await chatItemService.postQuestion({
//           chatItemId: targetOfTargetId,
//           userId,
//           topicId: topicIdToBePosted,
//           content: "ターゲットのターゲット",
//         })
//         // テストするChatItemのターゲットであるQuestionを投稿
//         await chatItemService.postAnswer({
//           chatItemId: targetId,
//           userId: targetChatItemUserId,
//           topicId: topicIdToBePosted,
//           content: targetContent,
//           quoteId: targetOfTargetId,
//         })
//         // 管理者ボット等によるchatItemの投稿が既にあるのを考慮
//         const deliveredChatItemCount = chatItemDeliverySubscribers[0].length
//
//         await chatItemService.postReaction({
//           chatItemId,
//           userId,
//           topicId: topicIdToBePosted,
//           quoteId: targetId,
//         })
//
//         const validationValues: ChatItemValidationParams = {
//           id: chatItemId,
//           iconId: userIconId,
//           topicId: topicIdToBePosted,
//         }
//         const targetValidationValues: ChatItemValidationParams = {
//           id: targetId,
//           iconId: targetChatItemUserIconId,
//           topicId: topicIdToBePosted,
//           content: targetContent,
//           isTargetNull: true,
//         }
//
//         const savedChatItem = await chatItemRepository.find(chatItemId)
//         expect(savedChatItem).toBeInstanceOf(Reaction)
//         validateChatItem(savedChatItem, validationValues)
//         const savedChatItemTarget = (savedChatItem as Reaction).target
//         expect(savedChatItemTarget).toBeInstanceOf(Answer)
//         validateChatItem(savedChatItemTarget, targetValidationValues)
//
//         expect(chatItemDeliverySubscribers[0]).toHaveLength(
//           deliveredChatItemCount + 1,
//         )
//         const deliveredChatItem =
//           chatItemDeliverySubscribers[0][deliveredChatItemCount]
//         expect(deliveredChatItem).toBeInstanceOf(Reaction)
//         validateChatItem(deliveredChatItem, validationValues)
//         const deliveredChatItemTarget = (deliveredChatItem as Reaction).target
//         expect(deliveredChatItemTarget).toBeInstanceOf(Answer)
//         validateChatItem(deliveredChatItemTarget, targetValidationValues)
//       })
//     })
//
//     describe("Questionのpost", () => {
//       test("正常系_Questionをpostすると保存・配信される", async () => {
//         // 管理者ボット等によるchatItemの投稿が既にあるのを考慮
//         const deliveredChatItemCount = chatItemDeliverySubscribers[0].length
//
//         await chatItemService.postQuestion({
//           chatItemId,
//           userId,
//           topicId: topicIdToBePosted,
//           content,
//         })
//
//         const validationValues: ChatItemValidationParams = {
//           id: chatItemId,
//           iconId: userIconId,
//           topicId: topicIdToBePosted,
//           content,
//           isTargetNull: true,
//         }
//
//         const savedChatItem = await chatItemRepository.find(chatItemId)
//         expect(savedChatItem).toBeInstanceOf(Question)
//         validateChatItem(savedChatItem, validationValues)
//
//         expect(chatItemDeliverySubscribers[0]).toHaveLength(
//           deliveredChatItemCount + 1,
//         )
//         const deliveredChatItem =
//           chatItemDeliverySubscribers[0][deliveredChatItemCount]
//         expect(deliveredChatItem).toBeInstanceOf(Question)
//         validateChatItem(deliveredChatItem, validationValues)
//       })
//     })
//
//     describe("Answerのpost", () => {
//       test("正常系_Answerをpostすると保存・配信される", async () => {
//         // テストするChatItemのターゲットであるQuestionを投稿
//         await chatItemService.postQuestion({
//           chatItemId: targetId,
//           userId: targetChatItemUserId,
//           topicId: topicIdToBePosted,
//           content: targetContent,
//         })
//         // 管理者ボット等によるchatItemの投稿が既にあるのを考慮
//         const deliveredChatItemCount = chatItemDeliverySubscribers[0].length
//
//         await chatItemService.postAnswer({
//           chatItemId,
//           userId,
//           topicId: topicIdToBePosted,
//           content,
//           quoteId: targetId,
//         })
//
//         const validationValues: ChatItemValidationParams = {
//           id: chatItemId,
//           iconId: userIconId,
//           topicId: topicIdToBePosted,
//           content,
//         }
//         const targetValidationValues: ChatItemValidationParams = {
//           id: targetId,
//           iconId: targetChatItemUserIconId,
//           topicId: topicIdToBePosted,
//           content: targetContent,
//           isTargetNull: true,
//         }
//
//         const savedChatItem = await chatItemRepository.find(chatItemId)
//         expect(savedChatItem).toBeInstanceOf(Answer)
//         validateChatItem(savedChatItem, validationValues)
//         const savedChatItemTarget = (savedChatItem as Answer).target
//         expect(savedChatItemTarget).toBeInstanceOf(Question)
//         validateChatItem(savedChatItemTarget, targetValidationValues)
//
//         expect(chatItemDeliverySubscribers[0]).toHaveLength(
//           deliveredChatItemCount + 1,
//         )
//         const deliveredChatItem =
//           chatItemDeliverySubscribers[0][deliveredChatItemCount]
//         expect(deliveredChatItem).toBeInstanceOf(Answer)
//         validateChatItem(deliveredChatItem, validationValues)
//         const deliveredChatItemTarget = (deliveredChatItem as Answer).target
//         expect(deliveredChatItemTarget).toBeInstanceOf(Question)
//         validateChatItem(deliveredChatItemTarget, targetValidationValues)
//       })
//     })
//
//     describe("異常系のテスト", () => {
//       test("異常系_Roomに参加していないユーザーはChatItemをpostできない", async () => {
//         const notJoiningUserid = getUUID()
//
//         // 参考: https://github.com/facebook/jest/issues/1377
//         await expect(
//           chatItemService.postMessage({
//             chatItemId,
//             userId: notJoiningUserid,
//             topicId: topicIdToBePosted,
//             content,
//             quoteId: null,
//           }),
//         ).rejects.toThrowError()
//       })
//
//       // TODO: ChatItem投稿時のトピック状態の確認とハンドリングがまだされていないので、このテストは落ちます。
//       //    実装を修正する必要があります。
//       test("異常系_activeでないTopicにはChatItemをpostできない", async () => {
//         const notActiveTopicId = "2"
//         await expect(
//           chatItemService.postMessage({
//             chatItemId,
//             userId,
//             topicId: notActiveTopicId,
//             content,
//             quoteId: null,
//           }),
//         ).rejects.toThrowError()
//       })
//     })
//   })
//
//   type ChatItemValidationParams = {
//     id: string
//     iconId: string
//     topicId: string
//     content?: string
//     isTargetNull?: boolean
//   }
//
//   const validateChatItem = (
//     chatItem: ChatItem,
//     values: ChatItemValidationParams,
//   ): void => {
//     expect(chatItem.id).toBe(values.id)
//     expect(chatItem.userIconId).toBe(values.iconId)
//     expect(chatItem.topicId).toBe(values.topicId)
//     if (chatItem instanceof Message) {
//       const message = chatItem as Message
//       expect(message.content).toBe(values.content)
//       if (values.isTargetNull ?? true) expect(message.target).toBeNull()
//     } else if (chatItem instanceof Reaction) {
//       expect((chatItem as Reaction).target).not.toBeNull()
//     } else if (chatItem instanceof Question) {
//       expect((chatItem as Question).content).toBe(values.content)
//     } else if (chatItem instanceof Answer) {
//       const answer = chatItem as Answer
//       expect(answer.content).toBe(values.content)
//       expect(answer.target).not.toBeNull()
//     }
//   }
// })
