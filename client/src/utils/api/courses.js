import { sendAuthenticatedRequest } from '../helpers';

/**
 * Creates a course with the given course name and members
 * @param {string} courseName
 * @param {{email: string, role: 'Student' | 'Educator'}[]} members
 * @param {NavigateFunction} navigate
 * @returns {Promise<{courseId: number}>}
 */
export function createCourse(courseName, members, navigate) {
  return sendAuthenticatedRequest(
    '/api/courses',
    navigate,
    'POST',
    { 'Content-Type': 'application/json' },
    JSON.stringify({ courseName, members })
  );
}

/**
 * Gets all courses for the current user
 * @param {NavigateFunction} navigate
 * @returns {Promise<{
 *  courseId: number,
 *  courseName: string,
 *  firstName: string,
 *  lastName: string,
 *}[]>}
 */
export function getCourses(navigate) {
  return sendAuthenticatedRequest('/api/courses', navigate);
}

/**
 * Deletes a course
 * @param {number} courseId
 * @param {NavigateFunction} navigate
 * @returns {Promise}
 */
export function deleteCourse(courseId, navigate) {
  return sendAuthenticatedRequest(`/api/courses/${courseId}`, navigate, 'DELETE');
}

/**
 * Updates the course's name to the given course name
 * @param {number} courseId
 * @param {string} courseName
 * @param {NavigateFunction} navigate
 * @returns {Promise}
 */
export function updateCourse(courseId, courseName, navigate) {
  return sendAuthenticatedRequest(
    `/api/courses/${courseId}`,
    navigate,
    'PUT',
    { 'Content-Type': 'application/json' },
    JSON.stringify({ courseName })
  );
}

/**
 * Gets course information for the given courseId.
 * Navigates to home page if course does not exist or if server
 * error occurs.
 * @param {number} courseId
 * @param {NavigateFunction} navigate
 * @returns {Promise<{courseId: number, courseName: string, firstName: string, lastName: string}>}
 */
export async function getCourse(courseId, navigate) {
  return sendAuthenticatedRequest(`/api/courses/${courseId}`, navigate).catch((err) => {
    navigate('/home');
    console.error(err.message);
  });
}
