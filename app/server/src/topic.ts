export type Topic = {
  id: string;
  title: string;
  description: string;
  urls: Partial<Record<TopicLinkType, string | undefined>>;
};

export type TopicLinkType = "github" | "slide" | "product";

export type TopicState = "not-started" | "active" | "paused" | "finished";
