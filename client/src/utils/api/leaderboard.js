import { sendAuthenticatedRequest } from '../helpers';
import { getMembers } from './members';

/**
 * Gets achievement leaderboard details of all the students on a course
 * @param {number} courseId
 * @param {NavigateFunction} navigate
 * @returns {Promise<{
 *  rank: number,
 *  userId: number,
 *  firstName: string,
 *  lastName: string,
 *  email: string,
 *  bronze: number,
 *  silver: number,
 *  gold: number
 * }[]>}
 */
export function getLeaderboard(courseId, navigate) {
  return sendAuthenticatedRequest(`/api/leaderboard/${courseId}/overview`, navigate);
}

/**
 * Creates a new achievement
 * @param {number} courseId
 * @param {string} achievementName
 * @param {string} type
 * @returns {Promise<{
 *  achievementCode: string,
 * }>}
 */
export function generateNewCode(courseId, achievementName, type, navigate) {
  return sendAuthenticatedRequest(
    `/api/leaderboard/${courseId}/achievements`,
    navigate,
    'POST',
    { 'Content-Type': 'application/json' },
    JSON.stringify({
      achievementName,
      type,
    })
  );
}

/**
 * Gets all the achievements of a given course
 * @param {number} courseId
 * @param {NavigateFunction} navigate
 * @returns {Promise<{
 *  achievementName: string,
 *  achievementCode: string,
 *  type: string
 * }[]>}
 */
export function getAllCourseAchievements(courseId, navigate) {
  return sendAuthenticatedRequest(`/api/leaderboard/${courseId}/achievements`, navigate);
}

/**
 * Gets all the achievements achieved by the current user in the given course
 * @param {number} courseId
 * @param {NavigateFunction} navigate
 * @returns {Promise<{
 *  achievementName: string,
 *  achievementCode: string,
 *  type: string
 * }>}
 */
export function getOwnAchievements(courseId, navigate) {
  return sendAuthenticatedRequest(`/api/leaderboard/${courseId}/user`, navigate);
}

/**
 * Awards a achievement to the current user if the code is valid
 * @param {number} courseId
 * @param {string} achievementCode
 * @param {NavigateFunction} navigate
 * @returns {Promise}
 */
export function unlockAchievement(courseId, achievementCode, navigate) {
  return sendAuthenticatedRequest(
    `/api/leaderboard/${courseId}/code`,
    navigate,
    'POST',
    { 'Content-Type': 'application/json' },
    JSON.stringify({
      achievementCode,
    })
  );
}

/**
 * Updates the name and type of an existing achievement
 * @param {number} courseId
 * @param {string} achievementCode
 * @param {string} achievementName
 * @param {string} type
 * @param {NavigateFunction} navigate
 * @returns {Promise}
 */
export function editAchievement(courseId, achievementCode, achievementName, type, navigate) {
  return sendAuthenticatedRequest(
    `/api/leaderboard/${courseId}/achievements/${achievementCode}`,
    navigate,
    'PUT',
    { 'Content-Type': 'application/json' },
    JSON.stringify({
      achievementName,
      type,
    })
  ).catch((err) => {
    console.error(err.message);
  });
}

/**
 * Deletes an existing achievement and removes it from every student who currently holds one
 * @param {number} courseId
 * @param {string} achievementCode
 * @param {NavigateFunction} navigate
 * @returns {Promise}
 */
export function deleteAchievement(courseId, achievementCode, navigate) {
  return sendAuthenticatedRequest(
    `/api/leaderboard/${courseId}/achievements/${achievementCode}`,
    navigate,
    'DELETE'
  ).catch((err) => {
    console.error(err.message);
  });
}

/**
 * Awards a achievement to a student with the associated email
 * @param {number} courseId
 * @param {string} email
 * @param {string} achievementCode
 * @param {NavigateFunction} navigate
 * @returns {Promise}
 */
export function awardAchievement(courseId, email, achievementCode, navigate) {
  return sendAuthenticatedRequest(
    `/api/leaderboard/${courseId}/award`,
    navigate,
    'POST',
    { 'Content-Type': 'application/json' },
    JSON.stringify({
      email,
      achievementCode,
    })
  );
}

/**
 * Gets all achievements for the user in the given course
 * @param {number} userId
 * @param {number} courseId
 * @param {NavigateFunction} navigate
 * @returns {Promise<{
 *  achievementCode: string,
 *  achievementName: string,
 *  type: string
 * }[]>}
 */
export function getAllUserAchievements(userId, courseId, navigate) {
  return sendAuthenticatedRequest(`/api/leaderboard/${courseId}/user/${userId}`);
}

/**
 * Gets all achievements for all members of a course
 * @param {number} courseId
 * @param {NavigateFunction} navigate
 * @returns {Promise<{
 *  userId: number
 *  firstName: number
 *  lastName: number
 *  email: string
 *  achievements: {
 *    achievementCode: string,
 *    achievementName: string,
 *    type: string
 *  }[]
 * }[]>}
 */
export async function getAllMembersAchievements(courseId, navigate) {
  return getMembers(courseId, navigate).then((members) =>
    Promise.all(
      members
        .filter(({ role }) => role === 'Student')
        .map((member) =>
          getAllUserAchievements(member.userId, courseId, navigate).then((achievements) => ({
            ...member,
            achievements,
          }))
        )
    )
  );
}
