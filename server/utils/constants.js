const multer = require('multer');
const path = require('path');
const DB_PATH = process.env.NODE_ENV === 'dev' ? '../toodles.db' : '../toodles_test.db';
const FILE_PATH = path.resolve(
  __dirname,
  process.env.NODE_ENV === 'dev' ? '../files' : '../testfiles'
);
const STORAGE = multer.diskStorage({
  destination: FILE_PATH,
  filename: (req, file, callback) => {
    callback(null, `${Date.now()}-${file.originalname}`);
  },
});

// Time buffers for quiz submissions and answers
const QUIZ_SUBMISSION_BUFFER = 3000;
const QUIZ_ANSWERS_RELEASE_BUFFER = 1000;

// achievement code length
const BADGE_CODE_LENGTH = 4;

// achievement code alphabet
const BADGE_CODE_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

// chatbot message history limit
const MAX_CHATBOT_MESSAGES = 20;

module.exports = {
  DB_PATH,
  FILE_PATH,
  STORAGE,
  QUIZ_SUBMISSION_BUFFER,
  QUIZ_ANSWERS_RELEASE_BUFFER,
  BADGE_CODE_LENGTH,
  BADGE_CODE_ALPHABET,
  MAX_CHATBOT_MESSAGES,
};
