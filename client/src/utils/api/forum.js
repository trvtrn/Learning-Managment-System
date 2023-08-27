import { getMembers } from './members';
import { sendAuthenticatedRequest } from '../helpers';

/**
 * Gets all categories for the given courseId.
 * @param {number} courseId
 * @param {NavigateFunction} navigate
 * @returns {Promise<{
 *  categoryId?: number
 *  categoryName: string
 *  categoryColor: string
 *  selectableForStudents: boolean
 * }[]>}
 */
export function getCategories(courseId, navigate) {
  return sendAuthenticatedRequest(`/api/categories/${courseId}`, navigate);
}

/**
 * Updates the categories in a course
 * @param {number} courseId
 * @param {{
 *  categoryId?: number
 *  categoryName: string
 *  categoryColor: string
 *  selectableForStudents: boolean
 * }[]} categories
 * @param {NavigateFunction} navigate
 */
export function updateCategories(courseId, categories, navigate) {
  return sendAuthenticatedRequest(
    `/api/categories`,
    navigate,
    'PUT',
    { 'Content-Type': 'application/json' },
    JSON.stringify({ courseId, categories })
  );
}

/**
 * Gets all posts for the given courseId.
 * @param {number} courseId
 * @param {NavigateFunction} navigate
 */
export function getPosts(courseId, navigate) {
  return sendAuthenticatedRequest(`/api/posts/${courseId}`, navigate);
}

/**
 * Updates post if postId is not undefined. Creates a new post otherwise
 * @param {number} courseId
 * @param {number} postId
 * @param {string} title
 * @param {number} categoryId
 * @param {string} content
 * @param {File[]} files
 * @param {boolean} shouldNotifyStudents
 * @param {NavigateFunction} navigate
 * @returns {Promise<{postId?: number}>}
 */
export function createOrUpdatePost(
  courseId,
  postId,
  title,
  categoryId,
  content,
  files,
  shouldNotifyStudents,
  navigate
) {
  const formData = new FormData();
  formData.append('courseId', courseId);
  formData.append('postId', postId);
  formData.append('title', title);
  formData.append('categoryId', categoryId);
  formData.append('text', content);
  formData.append('shouldNotifyStudents', shouldNotifyStudents);
  files.forEach((file) => formData.append('files', file));
  return sendAuthenticatedRequest(`/api/post`, navigate, postId ? 'PUT' : 'POST', {}, formData);
}

/**
 * Gets the details of the post with the given id
 * @param {number} postId
 * @param {NavigateFunction} navigate
 * @returns {Promise<{
 *  userId: number,
 *  title: string,
 *  firstName: string,
 *  lastName: string,
 *  timePosted: string,
 *  text: string,
 *  categoryId: number,
 *  categoryName: string,
 *  categoryColor: string,
 *  files: {fileId: number, fileName: string}[]
 *  replies: {
 *    timeSent: number,
 *    replyId: number,
 *    userId: number,
 *    firstName: string,
 *    lastName: string,
 *    text: string,
 *    files: {fileId: number, fileName: string}[]
 *  }[]
 * }>}
 */
export function getPost(postId, navigate) {
  return sendAuthenticatedRequest(`/api/post/${postId}`, navigate);
}

/**
 * Creates a reply if replyId is undefined, updates a reply if it is defined.
 * @param {number | undefined} postId
 * @param {number | undefined} replyId
 * @param {string} text
 * @param {File[]} files
 * @param {NavigateFunction} navigate
 * @returns {Promise<{replyId?: number}>}
 */
export function createOrUpdateReply(postId, replyId, text, files, navigate) {
  const formData = new FormData();
  formData.append('postId', postId);
  formData.append('replyId', replyId);
  formData.append('text', text);
  files.forEach((file) => formData.append('files', file));
  return sendAuthenticatedRequest('/api/reply', navigate, replyId ? 'PUT' : 'POST', {}, formData);
}

/**
 * Gets information about the reply with the given reply id
 * @param {number} replyId
 * @param {NavigateFunction} navigate
 * @returns {Promise<{
 *  userId: number,
 *  firstName: string,
 *  lastName: string,
 *  text: string,
 *  files: {fileId: number, fileName: string}[]
 * }>}
 */
export function getReply(replyId, navigate) {
  return sendAuthenticatedRequest(`/api/reply/${replyId}`, navigate)
    .then((data) => data)
    .catch((err) => console.error(err.message));
}

/**
 * Deletes reply with the given replyId
 * @param {number} replyId
 * @param {NavigateFunction} navigate
 * @returns {Promise}
 */
export function deleteReply(replyId, navigate) {
  return sendAuthenticatedRequest(`/api/reply/${replyId}`, navigate, 'DELETE');
}

/**
 * Deletes the post with the given postId
 * @param {number} postId
 * @param {NavigateFunction} navigate
 * @returns {Promise}
 */
export function deletePost(postId, navigate) {
  return sendAuthenticatedRequest(`/api/post/${postId}`, navigate, 'DELETE');
}

/**
 * Gets all forum posts written by educators in the given course
 * @param {number} courseId
 * @param {NavigateFunction} navigate
 * @returns {Promise<{
 *  userId: number,
 *  title: string,
 *  firstName: string,
 *  lastName: string,
 *  timePosted: string,
 *  text: string,
 *  categoryId: number,
 *  categoryName: string,
 *  categoryColor: string,
 * }[]>}
 */
export async function getAllEducatorPosts(courseId, navigate) {
  const posts = await getPosts(courseId, navigate);
  const members = await getMembers(courseId, navigate);
  const roles = new Map();
  for (const member of members) {
    roles.set(member.userId, member.role);
  }
  return posts.filter(
    (post) => roles.get(post.userId) === 'Educator' || roles.get(post.userId) === 'Creator'
  );
}
