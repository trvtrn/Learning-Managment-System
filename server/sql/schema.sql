PRAGMA foreignKeys=off;

BEGIN TRANSACTION;

CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY,
  firstName TEXT NOT NULL,
  lastName TEXT NOT NULL,
  email TEXT NOT NULL,
  password TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS courses (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS assignments (
  id INTEGER PRIMARY KEY,
  courseId INTEGER NOT NULL,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  fileGroupId INTEGER,
  releaseDate INTEGER NOT NULL,
  dueDate INTEGER NOT NULL,
  totalMarks INTEGER NOT NULL,
  weighting REAL NOT NULL,
  marksReleased INTEGER NOT NULL,
  FOREIGN KEY(courseId) REFERENCES courses(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS quizzes (
  id INTEGER PRIMARY KEY,
  courseId INTEGER NOT NULL,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  releaseDate INTEGER NOT NULL,
  dueDate INTEGER NOT NULL,
  duration INTEGER NOT NULL,
  weighting REAL NOT NULL,
  releaseMarks INTEGER NOT NULL,
  FOREIGN KEY(courseId) REFERENCES courses(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS enrollments (
  courseId INTEGER NOT NULL,
  userId INTEGER NOT NULL,
  role TEXT NOT NULL,
  finalGrade REAL,
  CONSTRAINT fkCourse
    FOREIGN KEY(courseId) REFERENCES courses(id) ON DELETE CASCADE,
  CONSTRAINT fkUsers
    FOREIGN KEY(userId) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS achievementOwnerships (
  userId INTEGER NOT NULL,
  achievementId INTEGER NOT NULL,
  FOREIGN KEY(userId) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY(achievementId) REFERENCES achievements(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS achievements (
  id INTEGER PRIMARY KEY,
  courseId INTEGER NOT NULL,
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  FOREIGN KEY(courseId) REFERENCES courses(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS onlineClasses (
  id INTEGER PRIMARY KEY,
  courseId INTEGER NOT NULL,
  name TEXT NOT NULL,
  startTime INTEGER NOT NULL,
  endTime INTEGER NOT NULL,
  frequency TEXT NOT NULL,
  FOREIGN KEY(courseId) REFERENCES courses(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS messages (
  id INTEGER PRIMARY KEY,
  onlineClassId INTEGER NOT NULL,
  userId INTEGER NOT NULL,
  timeSent INTEGER NOT NULL,
  text TEXT NOT NULL,
  FOREIGN KEY(onlineClassId) REFERENCES onlineClasses(id) ON DELETE CASCADE,
  FOREIGN KEY(userId) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS forumCategories (
  id INTEGER PRIMARY KEY,
  courseId INTEGER NOT NULL,
  name TEXT NOT NULL,
  color TEXT NOT NULL,
  selectableForStudents INTEGER NOT NULL,
  FOREIGN KEY(courseId) REFERENCES courses(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS forumPosts (
  id INTEGER PRIMARY KEY,
  courseId INTEGER NOT NULL,
  categoryId INTEGER,
  userId INTEGER NOT NULL,
  timePosted INTEGER NOT NULL,
  title TEXT NOT NULL,
  text TEXT NOT NULL,
  fileGroupId INTEGER,
  FOREIGN KEY(courseId) REFERENCES courses(id) ON DELETE CASCADE,
  FOREIGN KEY(userId) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS forumReplies(
  id INTEGER PRIMARY KEY,
  forumPostId INTEGER NOT NULL,
  userId INTEGER NOT NULL,
  timeSent INTEGER NOT NULL,
  text TEXT NOT NULL,
  fileGroupId INTEGER,
  FOREIGN KEY(forumPostId) REFERENCES forumPosts(id) ON DELETE CASCADE,
  FOREIGN KEY(userId) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS teachingMaterials (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  courseId INTEGER NOT NULL,
  description TEXT NOT NULL,
  fileGroupId INTEGER,
  timeCreated INTEGER NOT NULL,
  FOREIGN KEY(courseId) REFERENCES courses(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS assignmentSubmissions (
  id INTEGER PRIMARY KEY,
  assignmentId INTEGER NOT NULL,
  userId INTEGER NOT NULL,
  fileGroupId INTEGER NOT NULL,
  submissionTime INTEGER NOT NULL,
  mark REAL,
  markedById INTEGER,
  comment TEXT,
  FOREIGN KEY(assignmentId) REFERENCES assignments(id) ON DELETE CASCADE,
  FOREIGN KEY(userId) REFERENCES users(id) ON DELETE CASCADE
  FOREIGN KEY(markedById) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS quizQuestions (
  quizId INTEGER NOT NULL,
  questionNumber INTEGER NOT NULL,
  questionType TEXT NOT NULL,
  questionText TEXT NOT NULL,
  maximumMark INTEGER NOT NULL,
  FOREIGN KEY(quizId) REFERENCES quizzes(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS quizOptions (
  quizId INTEGER NOT NULL,
  questionNumber INTEGER NOT NULL,
  optionNumber INTEGER,
  optionText TEXT NOT NULL,
  isAnswer INTEGER NOT NULL,
  FOREIGN KEY(quizId) REFERENCES quizzes(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS quizSubmissions (
  quizId INTEGER NOT NULL,
  userId INTEGER NOT NULL,
  startTime INTEGER NOT NULL,
  markedById INTEGER,
  FOREIGN KEY(quizId) REFERENCES quizzes(id) ON DELETE CASCADE,
  FOREIGN KEY(userId) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS quizResponses (
  quizId INTEGER NOT NULL,
  userId INTEGER NOT NULL,
  questionNumber INTEGER NOT NULL,
  optionNumber INTEGER,
  answer TEXT,
  mark INTEGER,
  FOREIGN KEY(quizId) REFERENCES quizzes(id) ON DELETE CASCADE,
  FOREIGN KEY(userId) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS files (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  fileGroupId INTEGER,
  filePath TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS passwordResetTokens (
  id INTEGER PRIMARY KEY,
  userId INTEGER NOT NULL,
  token TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS chatbotMessages (
  id INTEGER PRIMARY KEY,
  message TEXT,
  sender TEXT,
  direction TEXT,
  userId INTEGER NOT NULL,
  messageTime INTEGER NOT NULL,
  FOREIGN KEY(userId) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS fileGroupIdCounter (
  counter INTEGER NOT NULL
);

INSERT INTO fileGroupIdCounter(counter)
SELECT 0
WHERE NOT EXISTS (SELECT * FROM fileGroupIdCounter)

COMMIT;

PRAGMA foreignKeys=on;