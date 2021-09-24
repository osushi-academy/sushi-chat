import Topic from "../domain/room/Topic"

/**
 * Topicモデルの配列に、orderを付与して辻褄を合わせるための関数
 * @param topics orderを含まないトピックの配列
 * @returns orderを含むトピックの配列
 * @deprecated
 */
export const covertToNewTopicArray = (topics: Topic[]) =>
  topics.map((topic) => ({
    ...topic,
    order: topic.id,
  }))
