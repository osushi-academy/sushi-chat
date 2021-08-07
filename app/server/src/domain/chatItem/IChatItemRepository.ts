import ChatItem from "./ChatItem"

interface IChatItemRepository {
  save(chatItem: ChatItem): void
  find<T extends ChatItem>(chatItemId: string): T
}

export default IChatItemRepository
