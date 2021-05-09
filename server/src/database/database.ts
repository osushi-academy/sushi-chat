import { v4 as uuid } from "uuid";
import { Client } from "pg";
import {
  ChatItemStore,
  ReactionStore,
  Reaction,
  AnswerStore,
  MessageStore,
  QuestionStore,
} from "../chatItem";
import { Topic } from "../topic";

export function clientCreate(): Client {
  const client = new Client({
    connectionString:
      process.env.DATABASE_URL ||
      "postgres://qabliybaqbojrs:33f010e49729bfe1596b5ce23dd0954dd46f8aad95f46ca0fb69c4ad28ee4470@ec2-23-22-191-232.compute-1.amazonaws.com:5432/d9aqjjqv0ao05c",
    ssl: {
      rejectUnauthorized: false,
    },
  });

  client.connect();
  return client;
}

export function insertRoom(
  client: Client,
  roomId: string,
  roomKey: string,
  title: string,
  status: number
) {
  client.query(
    {
      text:
        "INSERT INTO Rooms (id, roomKey, title, status) VALUES ($1, $2, $3, $4);",
      values: [roomId.toString(), roomKey, title, status],
    },
    (err) => {
      if (err) throw err;
    }
  );
}

export function insertTopics(client: Client, roomId: string, topics: Topic[]) {
  const values = topics
    .map(
      (topic) =>
        "('" +
        /* id */ topic.id +
        "','" +
        /* roomId */ roomId.toString() +
        "','" +
        /* title */ topic.title +
        "','" +
        /* description */ topic.description +
        "'," +
        /* state */ 0 +
        ",'" +
        /* githubUrl */ topic.urls.github +
        "','" +
        /* slideUrl */ topic.urls.slide +
        "','" +
        /* productUrl */ topic.urls.product +
        "')"
    )
    .join(",");

  const query =
    "INSERT INTO Topics (id, roomId, title, description, state, githubUrl, slideUrl, productUrl) VALUES" +
    values +
    ";";

  client.query(query, (err) => {
    if (err) throw err;
  });
}

export function insertChatItems(
  client: Client,
  messages: (MessageStore & { roomId: string })[],
  reactions: (ReactionStore & { roomId: string })[],
  questions: (QuestionStore & { roomId: string })[],
  answers: (AnswerStore & { roomId: string })[]
) {
  if (
    messages.length == 0 &&
    messages.length == 0 &&
    messages.length == 0 &&
    messages.length == 0
  ) {
    return;
  }
  const convertedMessages = messagesConverter(messages);
  const convertedReactions = reactionsConverter(reactions);
  const convertedQuestions = questionsConverter(questions);
  const convertedAnswers = answersConverter(answers);

  const values = [
    convertedMessages,
    convertedReactions,
    convertedQuestions,
    convertedAnswers,
  ]
    .filter((v) => v != "")
    .join(",");

  const query =
    "INSERT INTO chatItems (id, type, roomId, topicId, iconId, timestamp, createdAt, content, targetId) VALUES" +
    values +
    ";";

  client.query(query, (err) => {
    if (err) throw err;
  });
}

function messagesConverter(messages: (MessageStore & { roomId: string })[]) {
  return messages
    .map(
      (message) =>
        "('" +
        /* id */ message.id +
        "','" +
        /* type */ message.type +
        "','" +
        /* roomId */ message.roomId +
        "','" +
        /* topicId */ message.topicId +
        "','" +
        /* iconId */ message.iconId +
        "'," +
        /* timestamp */ message.timestamp +
        ",'" +
        /* createdAt */ new Date()
          .toISOString()
          .replace(/T/, " ")
          .replace(/\..+/, "") +
        "','" +
        /* content */ message.content +
        "'," +
        (message.target ? "'" + message.target + "'" : null) +
        ")"
    )
    .join(",");
}

function reactionsConverter(reactions: (ReactionStore & { roomId: string })[]) {
  return reactions
    .map(
      (reaction) =>
        "('" +
        /* id */ reaction.id +
        "','" +
        /* type */ reaction.type +
        "','" +
        /* roomId */ reaction.roomId +
        "','" +
        /* topicId */ reaction.topicId +
        "','" +
        /* iconId */ reaction.iconId +
        "'," +
        /* timestamp */ reaction.timestamp +
        ",'" +
        /* createdAt */ new Date()
          .toISOString()
          .replace(/T/, " ")
          .replace(/\..+/, "") +
        "'," +
        /* content */ null +
        ",'" +
        /* targetId */ reaction.target +
        "')"
    )
    .join(",");
}

function questionsConverter(questions: (QuestionStore & { roomId: string })[]) {
  return questions
    .map(
      (question) =>
        "('" +
        /* id */ question.id +
        "','" +
        /* type */ question.type +
        "','" +
        /* roomId */ question.roomId +
        "','" +
        /* topicId */ question.topicId +
        "','" +
        /* iconId */ question.iconId +
        "'," +
        /* timestamp */ question.timestamp +
        ",'" +
        /* createdAt */ new Date()
          .toISOString()
          .replace(/T/, " ")
          .replace(/\..+/, "") +
        "','" +
        /* content */ question.content +
        "'," +
        /* targetId */ null +
        ")"
    )
    .join(",");
}

function answersConverter(answers: (AnswerStore & { roomId: string })[]) {
  return answers
    .map(
      (answer) =>
        "('" +
        /* id */ answer.id +
        "','" +
        /* type */ answer.type +
        "','" +
        /* roomId */ answer.roomId +
        "','" +
        /* topicId */ answer.topicId +
        "','" +
        /* iconId */ answer.iconId.toString() +
        "'," +
        /* timestamp */ answer.timestamp +
        ",'" +
        /* createdAt */ new Date()
          .toISOString()
          .replace(/T/, " ")
          .replace(/\..+/, "") +
        "','" +
        /* content */ answer.content +
        "','" +
        /* targetId */ answer.target +
        "')"
    )
    .join(",");
}
