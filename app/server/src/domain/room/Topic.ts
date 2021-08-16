type Topic = {
  id: string
  title: string
  description: string
  urls: Partial<Record<TopicLinkType, string>>
  state: TopicState
}

type TopicLinkType = "github" | "slide" | "product"
type TopicState = "not-started" | "active" | "paused" | "finished"

export default Topic
