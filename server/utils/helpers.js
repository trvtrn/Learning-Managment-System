const fs = require('fs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const handlebars = require('handlebars');

/**
 * Returns a Date object whose date is date and time of day is time
 * @param {Date} date the Date object whose date is used
 * @param {Date} time the Date object whose time of day is used
 * @returns {Date} a new Date object
 */
function createDateTime(date, time) {
  const datetime = new Date(date);
  datetime.setHours(time.getHours());
  datetime.setMinutes(time.getMinutes());
  return datetime;
}

/**
 * Sends an email
 * @param {string} email - user's email
 * @param {string} subject - email subject
 * @param {JSON} payload - object containing the data fields for the email body e.g firstName, link
 * @param {string} template - contains the path to the email template
 * @returns {string} - info or error, the output from the sendMail attempt
 */
async function sendEmail(email, subject, payload, template) {
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: true,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
  const source = fs.readFileSync(template, 'utf8');
  const compiledTemplate = handlebars.compile(source);

  const info = await transporter.sendMail({
    from: `Toodles <${process.env.FROM_EMAIL}>`,
    to: email,
    subject,
    html: compiledTemplate(payload),
  });

  return info;
}
/**
 * Given the end time and frequency of a scheduled class, calculates the
 * next end time of that class.
 * @param {Date} endTime the end time of the class.
 * @param {string} frequency the class schedule (one of 'once', 'weekly' or 'fortnightly')
 * @returns {Date} Date object representing the next end time of the class
 */
function getNextEnd(endTime, frequency) {
  if (frequency === 'once') {
    return endTime;
  }
  const nextEnd = new Date(endTime);
  const inc = frequency === 'weekly' ? 7 : 14;
  while (nextEnd < Date.now()) {
    nextEnd.setDate(nextEnd.getDate() + inc);
  }
  return nextEnd;
}

/**
 * Given the ending time of a class, calculates the corresponding start time
 * Assumes that the class duration is less than the amount of time between
 * each class. That is, if the frequency is 'weekly', then the duration of the
 * class is less than 7 days. If the frequency is 'fortnightly', then the duration
 * of the class is less than 14 days.
 * @param {Date} startTime the start time of the class.
 * @param {Date} endTime the ending time of the class to calculate the start time for
 * @param {string} frequency 'once' | 'weekly' | 'fortnightly'
 * @returns {Date} Date object representing the next end time of the class
 */
function getStartForEnd(startTime, nextEnd, frequency) {
  if (frequency === 'once') {
    return startTime;
  }
  const inc = frequency === 'weekly' ? 7 : 14;
  const nextStart = new Date(startTime);
  const nextNextStart = new Date(startTime);
  nextNextStart.setDate(nextStart.getDate() + inc);
  while (nextNextStart < nextEnd) {
    nextStart.setDate(nextStart.getDate() + inc);
    nextNextStart.setDate(nextStart.getDate() + inc);
  }
  return nextStart;
}

/**
 * Creates a token based on the user's email
 * @param {string} email - the user email
 * @returns {token} - the token generated by jwt
 */
function createToken(userId) {
  return jwt.sign({ userId }, process.env.JWT_TOKEN_KEY, { expiresIn: '3d' });
}

/**
 * Converts a token to a userId
 * @param {string} token
 * @returns
 */
function tokenToUserId(token) {
  try {
    return jwt.verify(token, process.env.JWT_TOKEN_KEY).userId;
  } catch (error) {
    return -1;
  }
}

/**
 * Returns the userId given the token set in the authorization header.
 * Returns -1 if the authorization token is invalid
 */
function getUserIdIfAuthenticated(req) {
  const { authorization } = req.headers;
  if (!authorization) {
    return -1;
  }
  return tokenToUserId(authorization);
}

/**
 * Middleware function for protecting an endpoint with authentication.
 * Authenticates a user using a JWT token in the 'authorization'
 * header field. Sets the userId field of the request if successful.
 */
function authenticate(req, res, next) {
  const userId = getUserIdIfAuthenticated(req);
  if (userId === -1) {
    return res.status(401).send({ message: 'unauthenticated' });
  }
  req.userId = userId;
  next();
}

module.exports = {
  sendEmail,
  createDateTime,
  getNextEnd,
  getStartForEnd,
  createToken,
  tokenToUserId,
  authenticate,
};
