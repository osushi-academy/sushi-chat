import Message from "../../domain/chatItem/Message"
import { v4 as uuid } from "uuid"
import RoomClass from "../../domain/room/Room"
import Question from "../../domain/chatItem/Question"
import Answer from "../../domain/chatItem/Answer"
import { TopicState } from "sushi-chat-shared"

class RoomSystemMessageHelper {
  /**
   * トピック変更にともなうシステムメッセージを組み立てる
   * @param room ルームモデル
   * @param topicId 変更されたトピックID
   * @param oldState トピックの変更前のstate
   * @param newState トピックの変更後state
   * @returns システムメッセージ
   */
  public static buildTopicStateChangeSystemMessage(
    room: Readonly<RoomClass>,
    topicId: number,
    oldState: TopicState,
    newState: TopicState,
  ): Message {
    let message = ""

    if (newState === "ongoing" && oldState === "paused") {
      // NOTE: paused -> ongoing
      message = "発表が再開されました"
    } else if (newState === "ongoing") {
      // NOTE: not-started / finished -> ongoing
      message =
        "【運営Bot】\n発表が始まりました！\nコメントを投稿して盛り上げましょう 🎉🎉\n"
    } else if (newState === "paused") {
      // NOTE: ongoing -> paused
      message = "【運営Bot】\n 発表が中断されました"
    } else if (newState === "finished") {
      // NOTE: any -> finished
      // 質問の集計
      const questions = room.chatItems.filter(
        (c): c is Question => c instanceof Question && c.topicId === topicId,
      )
      // 回答済みの質問の集計
      const answeredIds = room.chatItems
        .filter(
          (c): c is Answer => c instanceof Answer && c.topicId === topicId,
        )
        .map(({ id }) => id)

      const questionMessages = questions.map(
        ({ id, content }) =>
          `Q. ${content}` + (answeredIds.includes(id) ? " [回答済]" : ""),
      )

      if (questionMessages.length === 0) {
        message =
          "【運営Bot】\n 発表が終了しました！\n（引き続きコメントを投稿いただけます）"
      } else {
        message = [
          "【運営Bot】\n 発表が終了しました！\n（引き続きコメントを投稿いただけます）\n",
          ...questionMessages,
        ].join("\n")
      }
    }

    const botMessage = new Message(
      uuid(),
      topicId,
      room.systemUser,
      "system",
      message,
      null,
      new Date(),
      room.calcTimestamp(topicId),
    )
    return botMessage
  }
}

export default RoomSystemMessageHelper
