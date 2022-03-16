DROP FUNCTION IF EXISTS set_update_time();
CREATE FUNCTION set_update_time() RETURNS trigger AS '
  begin
    new.updated_at := ''now'';
    return new;
  end;
' LANGUAGE 'plpgsql';

CREATE TABLE IF NOT EXISTS room_states
(
  id         INT PRIMARY KEY,
  name       TEXT      NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
DROP TRIGGER IF EXISTS update_room_states_trigger ON room_states;
CREATE TRIGGER update_room_states_trigger BEFORE UPDATE ON room_states FOR EACH ROW
  EXECUTE PROCEDURE set_update_time();

CREATE TABLE IF NOT EXISTS rooms
(
  id            UUID PRIMARY KEY,
  room_state_id INT       NOT NULL REFERENCES room_states (id),
  title         TEXT      NOT NULL,
  invite_key    UUID      NOT NULL,
  description   TEXT      NOT NULL,
  start_at      TIMESTAMP,
  finish_at     TIMESTAMP,
  archived_at   TIMESTAMP,
  created_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
DROP TRIGGER IF EXISTS update_rooms_trigger ON rooms;
CREATE TRIGGER update_rooms_trigger BEFORE UPDATE ON rooms FOR EACH ROW
  EXECUTE PROCEDURE set_update_time();

CREATE TABLE IF NOT EXISTS topic_states
(
  id         INT PRIMARY KEY,
  name       TEXT      NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
DROP TRIGGER IF EXISTS update_topic_states_trigger ON topic_states;
CREATE TRIGGER update_topic_states_trigger BEFORE UPDATE ON topic_states FOR EACH ROW
  EXECUTE PROCEDURE set_update_time();

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
DROP TRIGGER IF EXISTS update_topics_trigger ON topics;
CREATE TRIGGER update_topics_trigger BEFORE UPDATE ON topics FOR EACH ROW
  EXECUTE PROCEDURE set_update_time();

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

CREATE TABLE IF NOT EXISTS icons
(
  id         INT PRIMARY KEY,
  name       TEXT      NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
DROP TRIGGER IF EXISTS update_icons_trigger ON icons;
CREATE TRIGGER update_icons_trigger BEFORE UPDATE ON icons FOR EACH ROW
  EXECUTE PROCEDURE set_update_time();

CREATE TABLE IF NOT EXISTS users
(
  id         TEXT PRIMARY KEY,
  room_id    UUID      NOT NULL REFERENCES rooms (id),
  icon_id    INT       NOT NULL REFERENCES icons (id),
  is_admin   BOOLEAN   NOT NULL,
  is_system   BOOLEAN   NOT NULL,
  has_left   BOOLEAN   NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP NOT NULL DEFAULT current_timestamp
);
CREATE TABLE IF NOT EXISTS topics_speakers
(
  user_id  TEXT REFERENCES users (id),
  room_id  UUID,
  topic_id INT,
  PRIMARY KEY (user_id, room_id, topic_id),
  FOREIGN KEY (room_id, topic_id) REFERENCES topics (room_id, id)
);

CREATE TABLE IF NOT EXISTS admins
(
  id         TEXT PRIMARY KEY,
  name       TEXT      NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
DROP TRIGGER IF EXISTS update_admins_trigger ON admins;
CREATE TRIGGER update_admins_trigger BEFORE UPDATE ON admins FOR EACH ROW
  EXECUTE PROCEDURE set_update_time();

CREATE TABLE IF NOT EXISTS rooms_admins
(
  admin_id   TEXT REFERENCES admins (id),
  room_id    UUID REFERENCES rooms (id),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (admin_id, room_id)
);

CREATE TABLE IF NOT EXISTS sender_types
(
  id         INT PRIMARY KEY,
  name       TEXT      NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
DROP TRIGGER IF EXISTS update_sender_types_trigger ON sender_types;
CREATE TRIGGER update_sender_types_trigger BEFORE UPDATE ON sender_types FOR EACH ROW
  EXECUTE PROCEDURE set_update_time();

CREATE TABLE IF NOT EXISTS chat_item_types
(
  id         INT PRIMARY KEY,
  name       TEXT      NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
DROP TRIGGER IF EXISTS update_chat_item_types_trigger ON chat_item_types;
CREATE TRIGGER update_chat_item_types_trigger BEFORE UPDATE ON chat_item_types FOR EACH ROW
  EXECUTE PROCEDURE set_update_time();

CREATE TABLE IF NOT EXISTS chat_items
(
  id                UUID PRIMARY KEY,
  room_id           UUID      NOT NULL,
  topic_id          INT       NOT NULL,
  user_id           TEXT      NOT NULL REFERENCES users (id),
  chat_item_type_id INT       NOT NULL REFERENCES chat_item_types (id),
  sender_type_id    INT       NOT NULL REFERENCES sender_types (id),
  quote_id          UUID REFERENCES chat_items (id),
  content           TEXT,
  timestamp         INT,
  created_at        TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (room_id, topic_id) REFERENCES topics (room_id, id)
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

CREATE TABLE IF NOT EXISTS stamps
(
  id         UUID PRIMARY KEY,
  room_id    UUID      NOT NULL,
  topic_id   INT       NOT NULL,
  user_id    TEXT      NOT NULL REFERENCES users (id),
  timestamp  INT       NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (room_id, topic_id) REFERENCES topics (room_id, id)
);

CREATE TABLE IF NOT EXISTS service_admins
(
  id         INT PRIMARY KEY,
  name       TEXT      NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
DROP TRIGGER IF EXISTS update_service_admins_trigger ON service_admins;
CREATE TRIGGER update_service_admins_trigger BEFORE UPDATE ON service_admins FOR EACH ROW
  EXECUTE PROCEDURE set_update_time();
