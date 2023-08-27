import { sendAuthenticatedRequest } from '../helpers';

/**
 * Updates quiz if quizId is defined, creates quiz otherwise.
 * @param {number | undefined} quizId
 * @param {number | undefined} courseId
 * @param {string} name
 * @param {string} description
 * @param {string} releaseDate
 * @param {number} dueDate
 * @param {number} duration
 * @param {number} weighting
 * @param {{
 *  questionText: string,
 *  questionType: 'Multiple Choice' | 'Short Answer',
 *  maximumMark: number,
 *  options: {optionText: string, isAnswer: boolean}[]
 * }[]} questions
 * @param {NavigateFunction} navigate
 * @returns {Promise<number | undefined>}
 */
export function createOrUpdateQuiz(
  quizId,
  courseId,
  name,
  description,
  releaseDate,
  dueDate,
  duration,
  weighting,
  questions,
  navigate
) {
  return sendAuthenticatedRequest(
    '/api/quiz',
    navigate,
    quizId ? 'PUT' : 'POST',
    { 'Content-Type': 'application/json' },
    JSON.stringify({
      quizId,
      courseId,
      name,
      description,
      releaseDate,
      dueDate,
      duration,
      weighting,
      questions,
    })
  ).then(({ quizId: newQuizId }) => newQuizId);
}

/**
 * Gets quiz with given quizId
 * @param {number} quizId
 * @param {NavigateFunction} navigate
 * @returns {Promise<{
 *  name: string,
 *  description: string,
 *  releaseDate: number,
 *  dueDate: number,
 *  duration: number
 *  weighting: number
 *  questionText: string,
 *  questionType: 'Multiple Choice' | 'Short Answer',
 *  maximumMark: number,
 *  questions: {
 *    questionNumber: number,
 *    questionText: string,
 *    questionType: 'Multiple Choice' | 'Short Answer',
 *    maximumMark: number,
 *    options: {optionNumber: number, optionText: string, isAnswer?: boolean}[]
 *  }[]
 * }>}
 */
export function getQuiz(quizId, navigate) {
  return sendAuthenticatedRequest(`/api/quiz/${quizId}`, navigate);
}

/**
 * Gets all quizzes of the course with given courseId
 * @param {number} courseId
 * @param {NavigateFunction} navigate
 * @returns {Promise<{
 *  quizId: number,
 *  name: string,
 *  totalMarks: number,
 *  questionCount: number,
 *  releaseDate: number,
 *  dueDate: number,
 *  duration: number
 *  weighting: number,
 * }[]>}
 */
export function getQuizzes(courseId, navigate) {
  return sendAuthenticatedRequest(`/api/quizzes/${courseId}`, navigate);
}

/**
 * Creates submission for the current user for the given quizId
 * @param {number} quizId
 * @param {NavigateFunction} navigate
 * @returns {Promise}
 */
export function createSubmission(quizId, navigate) {
  return sendAuthenticatedRequest(`/api/quiz/${quizId}/submission`, navigate, 'POST');
}

/**
 * Updates the visibility of the mark for the given quizId
 * @param {number} quizId
 * @param {boolean} releaseMarks
 * @param {NavigateFunction} navigate
 * @returns {Promise}
 */
export function updateReleaseMarks(quizId, releaseMarks, navigate) {
  return sendAuthenticatedRequest(
    `/api/quiz/${quizId}/release`,
    navigate,
    'PUT',
    { 'Content-Type': 'application/json' },
    JSON.stringify({
      releaseMarks,
    })
  );
}

/**
 * Gets the submission for the current user for the given quizId
 * @param {number} quizId
 * @param {NavigateFunction} navigate
 * @returns {Promise<{
 *  questionNumber: number,
 *  optionNumber?: number,
 *  answerText?: string
 * }[]>}
 */
export function getOwnSubmission(quizId, navigate) {
  return sendAuthenticatedRequest(`/api/quiz/${quizId}/submission`, navigate);
}

/**
 * Gets the current user's marks for the given quiz
 * @param {number} quizId
 * @param {NavigateFunction} navigate
 * @returns {Promise<{
 *  questionNumber: number,
 *  mark: number
 * }[]>}
 */
export function getOwnMarks(quizId, navigate) {
  return sendAuthenticatedRequest(`/api/quiz/${quizId}/mark`, navigate);
}

/**
 * Updates the current user's submission for the given quiz
 * @param {number} quizId
 * @param {{
 *  questionNumber: number,
 *  optionNumber?: number,
 *  answerText?: string
 * }[]} answers
 * @param {Navigate} navigate
 * @returns
 */
export function updateOwnSubmission(quizId, answers, navigate) {
  return sendAuthenticatedRequest(
    `/api/quiz/${quizId}/submission`,
    navigate,
    'PUT',
    { 'Content-Type': 'application/json' },
    JSON.stringify({ quizId, answers })
  );
}

/**
 * Gets all submissions for the given quiz
 * @param {number} quizId
 * @param {NavigateFunction} navigate
 * @returns {Promise<{
 *  userId: number,
 *  firstName: string,
 *  lastName: string,
 *  email: string,
 *  mark: number,
 *  markerId?: number,
 *  markerFirstName?: string,
 *  markerLastName?: string
 * }>}
 */
export function getAllSubmissions(quizId, navigate) {
  return sendAuthenticatedRequest(`/api/quiz/${quizId}/submissions`, navigate);
}

/**
 * Deletes the quiz with the given quizId
 * @param {number} quizId
 * @param {NavigateFunction} navigate
 * @returns {Promise}
 */
export function deleteQuiz(quizId, navigate) {
  return sendAuthenticatedRequest(`/api/quiz/${quizId}`, navigate, 'DELETE');
}

/**
 * Gets submission for the given user
 * @param {number} quizId
 * @param {number} userId
 * @param {NavigateFunction} navigate
 * @returns {Promise<{
 *   questionNumber: number,
 *   answerText?: string,
 *   optionNumber?: number
 * }[]>}
 */
export function getSubmission(quizId, userId, navigate) {
  return sendAuthenticatedRequest(`/api/quiz/${quizId}/submission/${userId}`);
}

/**
 * Gets quiz marks for the given user
 * @param {number} quizId
 * @param {number} userId
 * @param {NavigateFunction} navigate
 * @returns {Promise<{
 *  questionNumber: number,
 *  mark: number
 * }[]>}
 */
export function getMarks(quizId, userId, navigate) {
  return sendAuthenticatedRequest(`/api/quiz/${quizId}/mark/${userId}`, navigate);
}

/**
 * Saves quiz marks for the given user in the given quiz
 */
export function updateMarks(quizId, userId, questionMarks, navigate) {
  return sendAuthenticatedRequest(
    `/api/quiz/${quizId}/mark/${userId}`,
    navigate,
    'PUT',
    { 'Content-Type': 'application/json' },
    JSON.stringify({ questionMarks })
  );
}
