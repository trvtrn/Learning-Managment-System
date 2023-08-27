import { sendAuthenticatedRequest } from '../helpers';

/**
 * Gets all members of the given course
 * @param {number} courseId
 * @param {NavigateFunction} navigate
 * @returns {Promise<{
 *  userId: number,
 *  firstName: string,
 *  lastName: string,
 *  email: string,
 *  role: string
 * }[]>}
 */
export function getMembers(courseId, navigate) {
  return sendAuthenticatedRequest(`/api/members/${courseId}`, navigate).then((data) => data);
}

/**
 * Updates the given user's role in the given course to the given role
 * @param {number} userId
 * @param {number} courseId
 * @param {'Student' | 'Educator'} role
 * @param {NavigateFunction} navigate
 * @returns {Promise}
 */
export function updateMemberRole(userId, courseId, role, navigate) {
  return sendAuthenticatedRequest(
    `/api/member`,
    navigate,
    'PUT',
    { 'Content-Type': 'application/json' },
    JSON.stringify({ userId, courseId, role })
  );
}

/**
 * Deletes member with the given id from the course
 * @param {number} courseId
 * @param {number} userId
 */
export function deleteMember(courseId, userId, navigate) {
  return sendAuthenticatedRequest(`/api/member/${courseId}/${userId}`, navigate, 'DELETE');
}

/**
 * Adds list of members to the given course
 * @param {{email: string, role: 'Student' | 'Educator'}[]} members
 */
export function addMembers(courseId, members, navigate) {
  return sendAuthenticatedRequest(
    `/api/members`,
    navigate,
    'POST',
    { 'Content-Type': 'application/json' },
    JSON.stringify({
      courseId,
      members,
    })
  );
}

/**
 * Gets the role for the user in the given course.
 * Navigates back to homepage dashboard if server error occurs or if user is not enrolled in the
 * course.
 * @param {number} courseId
 * @param {NavigateFunction} navigate
 * @returns {Promise<{'Creator' | 'Student' | 'Educator'}>}
 */
export async function getRole(courseId, navigate) {
  return sendAuthenticatedRequest(`/api/member/${courseId}`, navigate)
    .then((data) => {
      return data.role;
    })
    .catch((err) => {
      navigate('/home');
      console.error(err.message);
      throw Error(err.message);
    });
}
