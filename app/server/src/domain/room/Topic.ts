type Topic = {
  id: string
  title: string
  description: string
  urls: Partial<Record<TopicLinkType, string>>
  state: TopicState
}

export type TopicLinkType = "github" | "slide" | "product"
export type TopicState = "not-started" | "active" | "paused" | "finished"

export default Topic
