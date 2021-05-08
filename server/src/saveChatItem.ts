import { Client } from "pg";
import {
  AnswerStore,
  ChatItemStore,
  MessageStore,
  QuestionStore,
  ReactionStore,
} from "./chatItem";
import { insertChatItems } from "./database/database";

class SaveChatItemClass {
  public static chatItemQueue: {
    messagesQueue: (MessageStore & { roomId: string })[];
    reactionsQueue: (ReactionStore & { roomId: string })[];
    questionsQueue: (QuestionStore & { roomId: string })[];
    answersQueue: (AnswerStore & { roomId: string })[];
  } = {
    messagesQueue: [],
    reactionsQueue: [],
    questionsQueue: [],
    answersQueue: [],
  };
  public static client: Client;

  constructor(client: Client) {
    SaveChatItemClass.client = client;
  }

  public static pushQueue(chatItemStore: ChatItemStore, roomId: string) {
    switch (chatItemStore.type) {
      case "message":
        SaveChatItemClass.chatItemQueue.messagesQueue.push({
          ...chatItemStore,
          roomId,
        });
        break;
      case "reaction":
        SaveChatItemClass.chatItemQueue.reactionsQueue.push({
          ...chatItemStore,
          roomId,
        });
        break;
      case "question":
        SaveChatItemClass.chatItemQueue.questionsQueue.push({
          ...chatItemStore,
          roomId,
        });
        break;
      case "answer":
        SaveChatItemClass.chatItemQueue.answersQueue.push({
          ...chatItemStore,
          roomId,
        });
        break;
      default:
        break;
    }
  }

  public static saveChatItem() {
    insertChatItems(
      SaveChatItemClass.client,
      SaveChatItemClass.chatItemQueue.messagesQueue,
      SaveChatItemClass.chatItemQueue.reactionsQueue,
      SaveChatItemClass.chatItemQueue.questionsQueue,
      SaveChatItemClass.chatItemQueue.answersQueue
    );
    SaveChatItemClass.chatItemQueue.messagesQueue = [];
    SaveChatItemClass.chatItemQueue.reactionsQueue = [];
    SaveChatItemClass.chatItemQueue.questionsQueue = [];
    SaveChatItemClass.chatItemQueue.answersQueue = [];
  }

  public static chatItemIntervalSaver(): NodeJS.Timeout {
    return setInterval(() => {
      console.log("runned");
      this.saveChatItem();
    }, 60000);
  }
}

export default SaveChatItemClass;
