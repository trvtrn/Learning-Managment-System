const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const express = require('express');
const cors = require('cors');
const http = require('http');
const { WebSocketServer } = require('ws');
const { PeerServer } = require('peer');
const { configurePeerServer } = require('./scripts/peer');
const { configureWSS } = require('./scripts/websocket');

const app = express();

const assignmentRouter = require('./routes/assignment');
const authRouter = require('./routes/auth');
const categoriesRouter = require('./routes/categories');
const chatbotRouter = require('./routes/chatbot');
const classesRouter = require('./routes/classes');
const classRouter = require('./routes/class');
const coursesRouter = require('./routes/courses');
const fileRouter = require('./routes/file');
const materialRouter = require('./routes/material');
const materialsRouter = require('./routes/materials');
const membersRouter = require('./routes/members');
const memberRouter = require('./routes/member');
const postRouter = require('./routes/post');
const postsRouter = require('./routes/posts');
const quizRouter = require('./routes/quiz');
const quizzesRouter = require('./routes/quizzes');
const replyRouter = require('./routes/reply');
const leaderboardRouter = require('./routes/leaderboard');

app.use(express.json());

app.use(
  cors({
    credentials: true,
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (origin.match(new RegExp(`^(http|ws)s?://${process.env.DOMAIN}:[0-9]+$`))) {
        return callback(null, true);
      }
      return callback(new Error('Access has been blocked by CORS policy'), false);
    },
    credentials: true,
  })
);

app.use((req, res, next) => {
  console.log(req.path, req.method);
  next();
});
app.use('/api/assignment', assignmentRouter);
app.use('/api/auth', authRouter);
app.use('/api/categories', categoriesRouter);
app.use('/api/chatbot', chatbotRouter);
app.use('/api/class', classRouter);
app.use('/api/classes', classesRouter);
app.use('/api/courses', coursesRouter);
app.use('/api/file', fileRouter);
app.use('/api/material', materialRouter);
app.use('/api/materials', materialsRouter);
app.use('/api/member', memberRouter);
app.use('/api/members', membersRouter);
app.use('/api/post', postRouter);
app.use('/api/posts', postsRouter);
app.use('/api/quiz', quizRouter);
app.use('/api/quizzes', quizzesRouter);
app.use('/api/reply', replyRouter);
app.use('/api/leaderboard', leaderboardRouter);

const server = http.createServer(app);
const wsServer = new WebSocketServer({ noServer: true });
configureWSS(server, wsServer);

let peerServer;
if (process.env.NODE_ENV !== 'test') {
  peerServer = PeerServer({ path: '/', port: process.env.PEER_SERVER_PORT });
  configurePeerServer(peerServer);
}

server.listen(process.env.SERVER_PORT, () => {
  console.log(`connected to DB & listening on port ${process.env.SERVER_PORT}`);
});

module.exports = { server };
