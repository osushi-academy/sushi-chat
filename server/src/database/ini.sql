CREATE TABLE Rooms (
  id UUID NOT NULL PRIMARY KEY,
  roomKey VARCHAR(50) NOT NULL,
  title VARCHAR(20) NOT NULL,
  status INT NOT NULL
)

CREATE TABLE Topics (
    id UUID NOT NULL PRIMARY KEY,
    topicOrder INT NOT NULL,
    roomId UUID NOT NULL REFERENCES Rooms(id),
    title VARCHAR(20) NOT NULL,
    description TEXT NOT NULL,
    state INT NOT NULL,
    githubUrl TEXT,
    slideUrl TEXT,
    productUrl TEXT
)

CREATE TABLE Messages (
  id UUID NOT NULL PRIMARY KEY,
  roomId UUID NOT NULL REFERENCES Rooms(id),
  topicId UUID NOT NULL REFERENCES Topics(id),
  iconId VARCHAR(10) NOT NULL,
  timestamp INT NOT NULL,
  createdAt DATE NOT NULL,
  content TEXT NOT NULL,
  targetId UUID
)

CREATE TABLE Reactions (
  id UUID NOT NULL PRIMARY KEY,
  roomId UUID NOT NULL REFERENCES Rooms(id),
  topicId UUID NOT NULL REFERENCES Topics(id),
  iconId VARCHAR(10) NOT NULL,
  timestamp INT NOT NULL,
  createdAt DATE NOT NULL,
  targetId UUID NOT NULL REFERENCES Messages(id)
)

CREATE TABLE Questions (
  id UUID NOT NULL PRIMARY KEY,
  roomId UUID NOT NULL REFERENCES Rooms(id),
  topicId UUID NOT NULL REFERENCES Topics(id),
  iconId VARCHAR(10) NOT NULL,
  timestamp INT NOT NULL,
  createdAt DATE NOT NULL,
  content TEXT NOT NULL
)

CREATE TABLE Answers (
  id UUID NOT NULL PRIMARY KEY,
  roomId UUID NOT NULL REFERENCES Rooms(id),
  topicId UUID NOT NULL REFERENCES Topics(id),
  iconId VARCHAR(10) NOT NULL,
  timestamp INT NOT NULL,
  createdAt DATE NOT NULL,
  content TEXT NOT NULL,
  targetId UUID REFERENCES Questions(id)
)
