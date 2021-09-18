CREATE TABLE IF NOT EXISTS service_admins
(
  id         INT PRIMARY KEY,
  name       TEXT      NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS admins
(
  id         UUID PRIMARY KEY,
  name       TEXT      NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS users
(
  id         UUID PRIMARY KEY,
  room_id    UUID REFERENCES rooms (id),
  icon_id    INT REFERENCES icons (id),
  created_at TIMESTAMP NOT NULL DEFAULT current_timestamp
);

CREATE TABLE IF NOT EXISTS icons
(
  id         INT PRIMARY KEY,
  name       TEXT      NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS rooms
(
  id            UUID PRIMARY KEY,
  room_state_id INT       NOT NULL REFERENCES room_states (id),
  title         TEXT      NOT NULL,
  invite_key    UUID      NOT NULL,
  description   TEXT,
  start_at      TIMESTAMP,
  finish_at     TIMESTAMP,
  archived_at   TIMESTAMP,
  created_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS room_states
(
  id         INT PRIMARY KEY,
  name       TEXT      NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS rooms_admins
(
  admin_id   UUID REFERENCES admins (id),
  room_id    UUID REFERENCES rooms (id),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (admin_id, room_id)
);

CREATE TABLE IF NOT EXISTS topics
(
  room_id        UUID REFERENCES rooms (id),
  id             INT,
  topic_state_id INT       NOT NULL REFERENCES topic_states (id),
  title          TEXT      NOT NULL,
  offset_mil_sec INT       NOT NULL DEFAULT 0,
  created_at     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (room_id, id)
);

CREATE TABLE IF NOT EXISTS topics_speakers
(
  user_id  UUID REFERENCES users (id),
  room_id  UUID,
  topic_id INT,
  PRIMARY KEY (user_id, room_id, topic_id),
  FOREIGN KEY (room_id, topic_id) REFERENCES topics (room_id, id)
);

CREATE TABLE IF NOT EXISTS topic_states
(
  id         INT PRIMARY KEY,
  name       TEXT      NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS topic_opened_at
(
  room_id           UUID,
  topic_id          INT,
  opened_at_mil_sec BIGINT NOT NULL,
  PRIMARY KEY (room_id, topic_id),
  FOREIGN KEY (room_id, topic_id) REFERENCES topics (room_id, id)
);

CREATE TABLE IF NOT EXISTS topic_paused_at
(
  room_id           UUID,
  topic_id          INT,
  paused_at_mil_sec BIGINT NOT NULL,
  PRIMARY KEY (room_id, topic_id),
  FOREIGN KEY (room_id, topic_id) REFERENCES topics (room_id, id)
);

CREATE TABLE IF NOT EXISTS chat_items
(
  id                UUID PRIMARY KEY,
  room_id           UUID      NOT NULL,
  topic_id          INT       NOT NULL,
  user_id           UUID      NOT NULL REFERENCES users (id),
  chat_item_type_id INT       NOT NULL REFERENCES chat_item_types (id),
  sender_type_id    INT       NOT NULL REFERENCES sender_types (id),
  quote_id          UUID REFERENCES chat_items (id),
  content           TEXT,
  timestamp         INT,
  created_at        TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (room_id, topic_id) REFERENCES topics (room_id, id)
);

CREATE TABLE IF NOT EXISTS chat_item_types
(
  id         INT PRIMARY KEY,
  name       TEXT      NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS topics_pinned_chat_items
(
  room_id      UUID,
  topic_id     INT,
  chat_item_id UUID REFERENCES chat_items (id),
  created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (room_id, topic_id, chat_item_id, created_at),
  FOREIGN KEY (room_id, topic_id) REFERENCES topics (room_id, id)
);

CREATE TABLE IF NOT EXISTS sender_types
(
  id         INT PRIMARY KEY,
  name       TEXT      NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS stamps
(
  id         UUID PRIMARY KEY,
  room_id    UUID      NOT NULL,
  topic_id   INT       NOT NULL,
  user_id    UUID      NOT NULL REFERENCES users (id),
  timestamp  INT NOT NULL ,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (room_id, topic_id) REFERENCES topics (room_id, id)
);
