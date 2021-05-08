import { v4 as uuid } from "uuid";
import { Client } from "pg";
import { Message, Reaction } from "../chatItem";
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
        /* id */ uuid() +
        "'," +
        /* topicOrder */ topic.id +
        ",'" +
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
    "INSERT INTO Topics (id, topicOrder, roomId, title, description, state, githubUrl, slideUrl, productUrl) VALUES" +
    values +
    ";";

  client.query(query, (err) => {
    if (err) throw err;
  });
}

export function insertMessages(client: Client, messages: Message[]) {
  const values = messages
    .map(
      (message) =>
        "('" +
        /* id */ message.id +
        "','" +
        /* roomId */ "" +
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
        /* targetId */ null +
        ")"
    )
    .join(",");

  const query =
    "INSERT INTO Messages (id, roomId, topicId, iconId, timestamp, createdAt, content, targetId) VALUES" +
    values +
    ";";

  client.query(query, (err) => {
    if (err) throw err;
  });
}

export function insertReactions(client: Client, reactions: Reaction[]) {
  const values = reactions
    .map(
      (reaction) =>
        "('" +
        /* id */ reaction.id +
        "','" +
        /* roomId */ "" +
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
        "','" +
        /* targetId */ reaction.target.id +
        "')"
    )
    .join(",");

  const query =
    "INSERT INTO Reactions (id, roomId, topicId, iconId, timestamp, createdAt, targetId) VALUES" +
    values +
    ";";

  client.query(query, (err) => {
    if (err) throw err;
  });
}

// export function insertQuestions(client: Client, questions: Question[]) {
//   const values = questions
//     .map(
//       (question) =>
//         "('" +
//         /* id */ question.id +
//         "','" +
//         /* roomId */ question.roomId +
//         "','" +
//         /* topicId */ question.topicId +
//         "','" +
//         /* iconId */ question.iconId +
//         "'," +
//         /* timestamp */ question.timestamp +
//         ",'" +
//         /* createdAt */ new Date()
//           .toISOString()
//           .replace(/T/, " ")
//           .replace(/\..+/, "") +
//         "','" +
//         /* content */ question.content +
//         "')"
//     )
//     .join(",");

//   const query =
//     "INSERT INTO Question (id, roomId, topicId, iconId, timestamp, createdAt, content) VALUES" +
//     values +
//     ";";

//   client.query(query, (err) => {
//     if (err) throw err;
//   });
// }

// export function insertAnswers(client: Client, answers: Answer[]) {
//   const values = answers
//     .map(
//       (answer) =>
//         "('" +
//         /* id */ answer.id +
//         "','" +
//         /* roomId */ answer.roomId +
//         "','" +
//         /* topicId */ answer.topicId +
//         "','" +
//         /* iconId */ answer.iconId +
//         "'," +
//         /* timestamp */ answer.timestamp +
//         ",'" +
//         /* createdAt */ new Date()
//           .toISOString()
//           .replace(/T/, " ")
//           .replace(/\..+/, "") +
//         "','" +
//         /* content */ answer.content +
//         "','" +
//         /* targetId */ answer.targetId +
//         "')"
//     )
//     .join(",");

//   const query =
//     "INSERT INTO Question (id, roomId, topicId, iconId, timestamp, createdAt, content, targetId) VALUES" +
//     values +
//     ";";

//   client.query(query, (err) => {
//     if (err) throw err;
//   });
// }

export function db_check() {
  const client = clientCreate();
  const roomid = uuid();
  const topicid = uuid();
  const messageid = uuid();
  insertRoom(client, roomid, "test", "title", 0);
  insertTopics(client, roomid, [
    { id: topicid, title: "a", description: "", urls: {} },
    { id: uuid(), title: "b", description: "", urls: {} },
  ]);
  insertMessages(client, [
    {
      id: messageid,
      topicId: topicid,
      iconId: "0",
      type: "message",
      timestamp: 0,
      createdAt: new Date(),
      content: "test message",
      target: null,
    },
  ]);
  insertReactions(client, [
    {
      id: uuid(),
      topicId: topicid,
      type: "reaction",
      iconId: "1",
      timestamp: 5,
      createdAt: new Date(),
      target: {
        id: messageid,
        topicId: topicid,
        iconId: "0",
        type: "message",
        timestamp: 0,
        createdAt: new Date(),
        content: "test message",
        target: null,
      },
    },
  ]);
}
