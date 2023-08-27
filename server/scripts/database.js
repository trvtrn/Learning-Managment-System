const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');
const { DB_PATH } = require('../utils/constants');
const AuthDBHandler = require('../utils/database/auth');
const AssignmentDBHandler = require('../utils/database/assignment');
const ChatbotDBHandler = require('../utils/database/chatbot');
const CourseDBHandler = require('../utils/database/courses');
const MemberDBHandler = require('../utils/database/members');
const MaterialDBHandler = require('../utils/database/materials');
const QuizDBHandler = require('../utils/database/quizzes');
const FileDBHandler = require('../utils/database/file');
const ClassDBHandler = require('../utils/database/classes');
const ForumDBHandler = require('../utils/database/forum');
const LeaderboardDBHandler = require('../utils/database/leaderboard');

const db = new Database(DB_PATH);
const databaseSetupSql = fs.readFileSync(path.resolve(__dirname, '../sql/schema.sql')).toString();
databaseSetupSql.split('\n\n').forEach((sql) => db.prepare(sql).run());
db.exec('PRAGMA foreignKeys=ON');

const authHandler = new AuthDBHandler(db);
const fileHandler = new FileDBHandler(db);
const courseHandler = new CourseDBHandler(db, authHandler);
const assignmentHandler = new AssignmentDBHandler(db, fileHandler);
const classHandler = new ClassDBHandler(db, courseHandler);
const chatbotHandler = new ChatbotDBHandler(db, authHandler);
const forumHandler = new ForumDBHandler(db, fileHandler, courseHandler);
const materialHandler = new MaterialDBHandler(db, fileHandler, courseHandler);
const memberHandler = new MemberDBHandler(db, authHandler, courseHandler);
const quizHandler = new QuizDBHandler(db, courseHandler);
const leaderboardHandler = new LeaderboardDBHandler(db);

module.exports = {
  ...authHandler,
  ...fileHandler,
  ...courseHandler,
  ...assignmentHandler,
  ...classHandler,
  ...chatbotHandler,
  ...forumHandler,
  ...memberHandler,
  ...quizHandler,
  ...materialHandler,
  ...leaderboardHandler,
};
