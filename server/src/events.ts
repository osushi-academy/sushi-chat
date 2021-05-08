import { ChatItem, Room, Topic, TopicLinkType, TopicState } from "./chatItem";

/**
 * クライアントからサーバに送られるイベント名
 */
export type ReceiveEventName =
  | "ADMIN_BUILD_ROOM"
  | "ENTER_ROOM"
  | "ADMIN_ENTER_ROOM"
  | "ADMIN_START_ROOM"
  | "ADMIN_CHANGE_TOPIC_STATE"
  | "POST_CHAT_ITEM"
  | "ADMIN_FINISH_ROOM"
  | "ADMIN_CLOSE_ROOM";

/**
 * サーバからクライアントに送るイベント名
 */
export type SendEventName =
  | "PUB_ENTER_ROOM"
  | "PUB_LEAVE_ROOM"
  | "PUB_START_ROOM"
  | "PUB_CHANGE_TOPIC_STATE"
  | "PUB_CHAT_ITEM"
  | "PUB_FINISH_ROOM"
  | "PUB_CLOSE_ROOM"
  | "PUB_STAMP";

export type EventName = ReceiveEventName | SendEventName;

/**
 * ルームを立てる
 *
 * @user Admin
 * @event ADMIN_BUILD_ROOM
 */
export type AdminBuildRoomParams = {
  title: string;
  topics: {
    title: string;
    description: string;
    urls: Partial<Record<TopicLinkType, string>>;
  }[];
};

/**
 * ルームを立てる
 *
 * @user Admin
 * @event ADMIN_BUILD_ROOM
 */
export type AdminBuildRoomResponse = Room;

// コメントを投稿する POST_CHAT_ITEM
type PostChatItemParamsBase = {
  id: string;
  topicId: string;
  type: "message" | "reaction" | "question" | "answer";
};

export type PostChatItemMessageParams = PostChatItemParamsBase & {
  type: "message";
  content: string;
  target: string | null;
};

export type PostChatItemReactionParams = PostChatItemParamsBase & {
  type: "reaction";
  reactionToId: string;
};

export type PostChatItemQuestionParams = PostChatItemParamsBase & {
  type: "question";
  content: string;
};

export type PostChatItemAnswerParams = PostChatItemParamsBase & {
  type: "answer";
  content: string;
  target: string;
};

/**
 * コメントを投稿する
 *
 * @user General
 * @event POST_CHAT_ITEM
 */
export type PostChatItemParams =
  | PostChatItemMessageParams
  | PostChatItemReactionParams
  | PostChatItemQuestionParams
  | PostChatItemAnswerParams;

/**
 * スタンプを投稿する
 * @user General
 * @event POST_STAMP
 */
export type PostStampParams = { topicId: string };

/**
 * スタンプを配信する
 * @user General
 * @event PUB_STAMP
 */
export type PubStampParams = { iconId: string; topicId: string };

/**
 * トピックの状態を変更する
 * @user Admin
 * @event ADMIN_CHANGE_TOPIC_STATE
 */
export type AdminChangeTopicStateParams = {
  roomId: string; // 変更対象のroomId
  type: "CLOSE_AND_OPEN" | "PAUSE" | "OPEN" | "CLOSE"; // 変更の種別
  topicId: string; // 変更対象のtopicId
};

/**
 * 新規ユーザーが入室する
 * @user Noraml
 * @event ENTER_ROOM
 */
export type EnterRoomParams = {
  roomId: string;
  iconId: string;
};

/**
 * 新規ユーザーが入室する
 * @user Normal
 * @event ENTER_ROOM
 */
export type EnterRoomResponse = {
  chatItems: ChatItem[];
  topics: (Topic & { state: TopicState })[];
  activeUserCount: number;
};

/**
 * 管理者がルームに入室する
 * @user Admin
 * @event ADMIN_ENTER_ROOM
 */
export type AdminEnterRoomParams = {
  roomId: string;
};

/**
 * 管理者が入室する
 * @user Admin
 * @event ADMIN_ENTER_ROOM
 */
export type AdminEnterRoomResponse = {
  chatItems: ChatItem[];
  topics: (Topic & { state: TopicState })[];
  activeUserCount: number;
};

/**
 * 新規ユーザーの入室を配信する
 * @user General
 * @event PUB_ENTER_ROOM
 */
export type PubEnterRoomParams = {
  iconId: string;
  activeUserCount: number;
};

/**
 * ユーザーの退室を配信する
 * @user General
 * @event PUB_LEAVE_ROOM
 */
export type PubLeaveRoomParams = {
  iconId: string;
  activeUserCount: number;
};

/**
 * トピックの状態を変更する
 * @user General
 * @type PUB_CHANGE_TOPIC_STATE
 */
export type PubChangeTopicStateParams = {
  type: "CLOSE_AND_OPEN" | "PAUSE" | "OPEN" | "CLOSE"; // 変更の種別
  topicId: string; // 変更対象のtopicId
};

export type ReceiveEventParams = {
  ADMIN_BUILD_ROOM: AdminBuildRoomParams;
  ENTER_ROOM: EnterRoomParams;
  ADMIN_ENTER_ROOM: AdminEnterRoomParams;
  ADMIN_START_ROOM: never;
  ADMIN_CHANGE_TOPIC_STATE: AdminChangeTopicStateParams;
  POST_CHAT_ITEM: PostChatItemParams;
  ADMIN_FINISH_ROOM: never;
  ADMIN_CLOSE_ROOM: never;
  POST_STAMP: PostStampParams;
};

export type ReceiveEventResponses = {
  ADMIN_BUILD_ROOM: AdminBuildRoomResponse;
  ENTER_ROOM: EnterRoomResponse;
  ADMIN_ENTER_ROOM: AdminEnterRoomResponse;
  ADMIN_START_ROOM: never;
  ADMIN_CHANGE_TOPIC_STATE: never;
  POST_CHAT_ITEM: never;
  ADMIN_FINISH_ROOM: never;
  ADMIN_CLOSE_ROOM: never;
  POST_STAMP: never;
};

export type SendEventBody<T extends SendEventName> = T extends "PUB_CHAT_ITEM"
  ? ChatItem
  : T extends "PUB_CHANGE_TOPIC_STATE"
  ? PubChangeTopicStateParams
  : T extends "PUB_ENTER_ROOM"
  ? PubEnterRoomParams
  : T extends "PUB_LEAVE_ROOM"
  ? PubLeaveRoomParams
  : T extends "PUB_STAMP"
  ? PubStampParams
  : never;
