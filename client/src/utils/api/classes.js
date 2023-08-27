import { sendAuthenticatedRequest } from '../helpers';

/**
 * Creates class for the given course if classId is undefined. Otherwise,
 * updates the class.
 * @param {number | undefined} classId
 * @param {number | undefined} courseId
 * @param {string} className
 * @param {number} startTime
 * @param {number} endTime
 * @param {'once' | 'weekly' | 'fortnightly'} frequency
 * @param {NavigateFunction} navigate
 * @returns {Promise}
 */
export function createOrUpdateClass(
  classId,
  courseId,
  className,
  startTime,
  endTime,
  frequency,
  navigate
) {
  return sendAuthenticatedRequest(
    '/api/class',
    navigate,
    classId ? 'PUT' : 'POST',
    {
      'Content-Type': 'application/json',
    },
    JSON.stringify({
      classId,
      courseId,
      className,
      startTime,
      endTime,
      frequency,
    })
  );
}

/**
 * Gets all classes for the given course
 * @param {number} courseId
 * @param {NavigateFunction} navigate
 * @returns
 */
export function getClasses(courseId, navigate) {
  return sendAuthenticatedRequest(`/api/classes/${courseId}`, navigate);
}

/**
 * Gets class details
 * @param {number} classId
 * @param {NavigateFunction} navigate
 * @returns {Promise<{
 *  className: string,
 *  messages: {
 *    messageId: number,
 *    userId: number,
 *    firstName: string,
 *    lastName: string,
 *    timeSent: number,
 *    text: string
 *  }[]
 * }>}
 */
export function getClass(classId, navigate) {
  return sendAuthenticatedRequest(`/api/class/${classId}`, navigate);
}

/**
 * Deletes class with the given classId
 * @param {number} classId
 * @param {NavigateFunction} navigate
 */
export function deleteClass(classId, navigate) {
  return sendAuthenticatedRequest(`/api/class/${classId}`, navigate, 'DELETE');
}
