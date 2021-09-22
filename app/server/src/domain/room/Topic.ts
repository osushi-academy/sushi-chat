import { TopicState } from "sushi-chat-shared"

type Topic = {
  id: number
  title: string
  state: TopicState
  pinnedChatItemId?: string
}

/**
 * @var {number} topicTimeData.openedDate トピックの開始時刻
 * @var {number} topicTimeData.pausedDate トピックが最後に一時停止された時刻
 * @var {number} topicTimeData.offsetTime トピックが一時停止されていた総時間
 */
export type TopicTimeData = {
  openedDate: number | null
  pausedDate: number | null
  offsetTime: number
}

export default Topic
