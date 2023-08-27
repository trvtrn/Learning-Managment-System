import { AUTH_FAILED_ERROR, SERVER_URL, STOP_WORDS } from './constants';

/**
 * Returns the string representation of the time of a given date object.
 * @param {Date} date a Date object
 * @returns string in the format HH:MM aa in local time
 */
export function toTimeString(date) {
  return date.toLocaleTimeString('en-au', {
    timeStyle: 'short',
  });
}

/**
 * Returns the string representation of the date of a given date object.
 * @param {Date} date a Date object
 * @returns string in the format DD/MM/YYYY
 */
export function toDateString(date) {
  return date.toLocaleDateString('en-au');
}

/**
 * Returns a Date object whose date is date and time of day is time
 * @param {Date} date the Date object whose date is used
 * @param {Date} time the Date object whose time of day is used
 * @returns {Date} a new Date object
 */
export function createDateTime(date, time) {
  const datetime = new Date(date);
  datetime.setHours(time.getHours());
  datetime.setMinutes(time.getMinutes());
  return datetime;
}

/**
 * Returns true if the provided email is valid and false otherwise.
 * @param {string} email
 * @returns {boolean}
 */
export function isValidEmail(email) {
  const re =
    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
}

/**
 * Sends authenticated request to the server and returns a promise which will resolve
 * with the status and data sent back by the server.
 * Navigates to login page if token cannot be found or server returns an 'unauthenticated' error.
 * @param {string} endpoint
 * @param {NavigateFunction} navigate function returned from useNavigate
 * @param {string} method GET, POST, PUT or DELETE
 * @param {Object} headers header to send with request
 * @param {Object} payload body of request
 * @returns {Promise<{data?: Object, blob?: Blob}>}
 */
export async function sendAuthenticatedRequest(
  endpoint,
  navigate,
  method = 'GET',
  headers = {},
  payload = undefined
) {
  if (!localStorage.getItem('token')) {
    if (
      window.location.pathname !== '/register' &&
      window.location.pathname !== '/reset' &&
      window.location.pathname !== '/linkreset'
    ) {
      navigate('/login');
    }
    throw Error('no token');
  }
  return fetch(`${SERVER_URL}${endpoint}`, {
    method,
    headers: {
      ...headers,
      authorization: localStorage.getItem('token'),
    },
    body: payload,
  }).then((response) => {
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.indexOf('application/json') !== -1) {
      return response.json().then((data) => {
        if (response.status < 200 || response.status > 299) {
          if (data.message === AUTH_FAILED_ERROR) {
            localStorage.clear();
            navigate('/login');
          }
          throw Error(data.message);
        }
        return data;
      });
    }
    return response.blob();
  });
}

/**
 * Returns whether rich text content is blank or not
 */
export function isBlank(content) {
  return content
    .replace(/<(.|\n)*?>/g, '')
    .trim()
    .match(/^\s*$/);
}

/**
 * Returns all matching entities with the given search term
 * Intended for use with the search bar
 * @param {string} searchTerm the search term
 * @param {{id: number, title: string, string: string}} entities objects containing an id, title and text (assumed to a string of HTML)
 * @returns {Set<number>}
 */
export function getMatchingEntities(searchTerm, entities) {
  // Break up search terms and delete any stop words
  const terms = searchTerm
    .toLowerCase()
    .split(' ')
    .filter((str) => str.length > 0 && !STOP_WORDS.includes(str));
  if (terms.length === 0) {
    return new Set();
  }

  // Break up title and text into individual words
  const rawEntities = entities.map((entity) => ({
    id: entity.id,
    title: entity.title
      .toLowerCase()
      .split(' ')
      .filter((str) => str.length > 0 && !STOP_WORDS.includes(str)),
    text: entity.text
      .toLowerCase()
      .replace(/<(.|\n)*?>/g, ' ')
      .replace(/\s+/g, ' ')
      .split(' ')
      .filter((str) => str.length > 0 && !STOP_WORDS.includes(str)),
  }));

  // Find entities with matching title and text content
  const matchingEntityIds = new Set();
  for (const term of terms) {
    for (const entity of rawEntities) {
      if (entity.title.includes(term) || entity.text.includes(term)) {
        matchingEntityIds.add(entity.id);
      }
    }
  }
  return matchingEntityIds;
}

/**
 * Checks whether a date input is valid
 * @param {Moment} d
 * @returns {boolean}
 */
export function isValidDateTimeInput(d) {
  return d !== null && !isNaN(d?.$d);
}

/**
 * Generates a unique key generator for rendering a list of components
 * @returns {function(): number}
 */
export function createKeyGenerator() {
  let currentKey = 0;
  function getNextKey() {
    currentKey += 1;
    return currentKey;
  }
  return getNextKey;
}

/**
 * Returns a formatted date given the date input
 * @param {Moment} d
 * @returns {string}
 */
export function formatDate(d) {
  return `${toDateString(d)} ${toTimeString(d)}`;
}

/**
 * Given the end time and frequency of a scheduled class, calculates the
 * next end time of that class.
 * @param {Date} endTime the end time of the class.
 * @param {string} frequency the class schedule (one of 'once', 'weekly' or 'fortnightly')
 * @returns {Date} Date object representing the next end time of the class
 */
export function getNextEnd(endTime, frequency) {
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
 * Groups adjacent messages together by senderId
 * @param {{
 *  senderId: number,
 *  senderFirstName: string,
 *  senderLastName: string,
 *  message: string,
 *  timeSent: number
 * }[]} messages
 * @returns {{
 *  senderId: number,
 *  senderFirstName: string,
 *  senderLastName: string,
 *  messages: {
 *   timeSent: number
 *   message: string
 *  }[]
 * }}
 */
export function groupMessages(messages) {
  if (messages.length === 0) {
    return [];
  }
  const groupedMessages = [];
  for (let i = 0; i < messages.length; i += 1) {
    if (i === 0 || messages[i].senderId !== messages[i - 1].senderId) {
      groupedMessages.push({
        senderId: messages[i].senderId,
        senderFirstName: messages[i].senderFirstName,
        senderLastName: messages[i].senderLastName,
        messages: [
          {
            messageId: messages[i].messageId,
            message: messages[i].message,
          },
        ],
      });
    } else {
      groupedMessages[groupedMessages.length - 1].messages.push({
        messageId: messages[i].messageId,
        message: messages[i].message,
      });
    }
  }
  return groupedMessages;
}

/**
 * Compares members
 * @param {{firstName: string, lastName: string, email: string}} a
 * @param {{firstName: string, lastName: string, email: string}} b
 * @returns {number} -1 if a < b, 1 otherwise
 */
export function compareMembers(a, b) {
  if (a.firstName < b.firstName) {
    return -1;
  }
  if (a.firstName > b.firstName) {
    return 1;
  }
  if (a.lastName < b.lastName) {
    return -1;
  }
  if (a.lastName > b.lastName) {
    return 1;
  }
  if (a.email < b.email) {
    return -1;
  }
  return 1;
}

/**
 * Computes whether a mark was obtained from the MC question
 * @param {number | string | undefined} studentResponse
 * @param {string} options
 * @returns 1 if a mark was gained, 0 if not
 */
export function calculateSingleMCMark(studentResponse, options) {
  return options.some((option) => studentResponse === option.optionNumber && option.isAnswer)
    ? 1
    : 0;
}

/**
 * Computes how many marks were obtained from multiple choice questions
 * @param {Map<number, string | number>} studentResponses
 * @param {{
 *  questionType: string,
 *  questionNumber: number,
 *  options: {
 *    optionNumber: number,
 *    optionText: string,
 *    isAnswer: boolean
 *  }[]
 * }[]}
 * @returns total marks gained from MC questions
 */
export function calculateMCMark(studentResponses, questions) {
  let count = 0;
  questions.forEach((question) => {
    if (question.questionType !== 'Multiple Choice') {
      return;
    }
    const studentResponse = studentResponses.get(question.questionNumber);
    if (typeof studentResponse !== 'number') {
      return;
    }
    count += calculateSingleMCMark(studentResponse, question.options);
  });
  return count;
}

/**
 * Formats the time as mm:ss given the time left in seconds
 * @param {number} timeInSeconds
 * @returns {string}
 */
export function formatTime(timeInSeconds) {
  const minutes = Math.floor(timeInSeconds / 60)
    .toString()
    .padStart(2, '0');
  const seconds = Math.floor(timeInSeconds % 60)
    .toString()
    .padStart(2, '0');
  return `${minutes}:${seconds}`;
}
