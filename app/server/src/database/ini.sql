CREATE TABLE Rooms (
  id UUID NOT NULL PRIMARY KEY,
  roomKey VARCHAR(50) NOT NULL,
  title VARCHAR(20) NOT NULL,
  status INT NOT NULL
);

CREATE TABLE Topics (
    id INT NOT NULL,
    roomId UUID NOT NULL REFERENCES Rooms(id),
    title VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    state INT NOT NULL,
    githubUrl TEXT,
    slideUrl TEXT,
    productUrl TEXT,
    PRIMARY KEY (id, roomId)
);

CREATE TABLE ChatItems (
  id UUID NOT NULL PRIMARY KEY,
  type VARCHAR(10) NOT NULL,
  roomId UUID NOT NULL REFERENCES Rooms(id),
  topicId INT NOT NULL,
  iconId VARCHAR(10) NOT NULL,
  timestamp INT,
  createdAt TIMESTAMP NOT NULL,
  content TEXT,
  targetId UUID REFERENCES ChatItems(id)
);

CREATE TABLE Stamps (
    id SERIAL PRIMARY KEY,
    roomId UUID NOT NULL,
    topicId INT NOT NULL,
    userId VARCHAR(30) NOT NULL,
    timestamp INT NOT NULL,
    createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (roomId, topicId) REFERENCES topics(roomId, id)
)

-- ChatItemsに統合したから使っていないらしい↓

-- CREATE TABLE Messages (
--   id UUID NOT NULL PRIMARY KEY,
--   roomId UUID NOT NULL REFERENCES Rooms(id),
--   topicId UUID NOT NULL REFERENCES Topics(id),
--   iconId VARCHAR(10) NOT NULL,
--   timestamp INT NOT NULL,
--   createdAt TIMESTAMP NOT NULL,
--   content TEXT NOT NULL,
--   targetId UUID
-- );

-- CREATE TABLE Reactions (
--   id UUID NOT NULL PRIMARY KEY,
--   roomId UUID NOT NULL REFERENCES Rooms(id),
--   topicId UUID NOT NULL REFERENCES Topics(id),
--   iconId VARCHAR(10) NOT NULL,
--   timestamp INT NOT NULL,
--   createdAt TIMESTAMP NOT NULL,
--   targetId UUID NOT NULL REFERENCES Messages(id)
-- );

-- CREATE TABLE Questions (
--   id UUID NOT NULL PRIMARY KEY,
--   roomId UUID NOT NULL REFERENCES Rooms(id),
--   topicId UUID NOT NULL REFERENCES Topics(id),
--   iconId VARCHAR(10) NOT NULL,
--   timestamp INT NOT NULL,
--   createdAt TIMESTAMP NOT NULL,
--   content TEXT NOT NULL
-- );

-- CREATE TABLE Answers (
--   id UUID NOT NULL PRIMARY KEY,
--   roomId UUID NOT NULL REFERENCES Rooms(id),
--   topicId UUID NOT NULL REFERENCES Topics(id),
--   iconId VARCHAR(10) NOT NULL,
--   timestamp INT NOT NULL,
--   createdAt TIMESTAMP NOT NULL,
--   content TEXT NOT NULL,
--   targetId UUID REFERENCES Questions(id)
-- );
