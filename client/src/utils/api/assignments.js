import { sendAuthenticatedRequest } from '../helpers';
/**
 * Creates assignment in course if assignmentId is undefined.
 * Updates assignment otherwise.
 * @param {number} assignmentId
 * @param {number} courseId
 * @param {string} assignmentName
 * @param {number} releaseDate
 * @param {number} dueDate
 * @param {number} totalMarks
 * @param {number} weighting
 * @param {string} description
 * @param {File[]} files
 * @param {NavigateFunction} navigate
 * @returns {Promise<{assignmentId?: number}>}
 */
export function createOrUpdateAssignment(
  assignmentId,
  courseId,
  assignmentName,
  releaseDate,
  dueDate,
  totalMarks,
  weighting,
  description,
  files,
  navigate
) {
  const formData = new FormData();
  formData.append('courseId', parseInt(courseId, 10));
  formData.append('assignmentId', assignmentId ? parseInt(assignmentId, 10) : assignmentId);
  formData.append('assignmentName', assignmentName);
  formData.append('releaseDate', releaseDate);
  formData.append('dueDate', dueDate);
  formData.append('totalMarks', totalMarks);
  formData.append('weighting', weighting);
  formData.append('description', description);
  files.forEach((file, idx) => {
    formData.append('files', file);
  });

  return sendAuthenticatedRequest(
    '/api/assignment',
    navigate,
    assignmentId !== undefined ? 'PUT' : 'POST',
    {},
    formData
  );
}

/**
 * Gets all assignments for the given course
 * @param {number} courseId
 * @param {NavigateFunction} navigate
 * @returns {Promise<{
 *  assignmentId: number,
 *  assignmentName: string,
 *  dueDate: number
 * }[]>}
 */
export function getAllAssignments(courseId, navigate) {
  return sendAuthenticatedRequest(`/api/assignment/all/${courseId}`, navigate);
}

/**
 * Gets assignment with the given id
 * @param {number} assignmentId
 * @param {NavigateFunction} navigate
 * @returns {Promise<
 *  assignmentName: string,
 *  description: string,
 *  totalMarks: number,
 *  releaseDate: number,
 *  dueDate: number,
 *  weighting: number,
 *  marksReleased: boolean
 *  files: {fileId: number, fileName: string}
 * >}
 */
export function getAssignment(assignmentId, navigate) {
  return sendAuthenticatedRequest(`/api/assignment/${assignmentId}`, navigate);
}

/**
 * Deletes assignment with given assignmentId
 * @param {number} assignmentId
 * @param {NavigateFunction} navigate
 * @returns {Promise}
 */
export function deleteAssignment(assignmentId, navigate) {
  return sendAuthenticatedRequest(`/api/assignment/${assignmentId}`, navigate, 'DELETE');
}

/**
 * Creates an assignment submission
 * @param {number} assignmentId
 * @param {File} file
 * @param {NavigateFunction} navigate
 * @returns {Promise}
 */
export function updateAssignmentSubmission(assignmentId, file, navigate) {
  const formData = new FormData();
  formData.append('files', file);
  formData.append('assignmentId', assignmentId);
  return sendAuthenticatedRequest(`/api/assignment/submission`, navigate, 'PUT', {}, formData);
}

/**
 * Gets assignment submission for the given user
 * @param {number} assignmentId
 * @param {number} userId
 * @param {NavigateFunction} navigate
 */
export function getAssignmentSubmission(assignmentId, userId, navigate) {
  return sendAuthenticatedRequest(`/api/assignment/${assignmentId}/submission/${userId}`, navigate);
}

/**
 * Updates assignment mark and comment
 * @param {number} submissionId
 * @param {number} mark
 * @param {string} comment
 * @param {NavigateFunction} navigate
 * @returns {Promise}
 */
export function updateAssignmentMark(submissionId, mark, comment, navigate) {
  return sendAuthenticatedRequest(
    `/api/assignment/mark`,
    navigate,
    'PUT',
    { 'Content-Type': 'application/json' },
    JSON.stringify({
      submissionId,
      mark,
      comment,
    })
  );
}

/**
 * Gets all assignment submissions
 * @param {number} assignmentId
 * @param {NavigateFunction} navigate
 * @returns {Promise<{
 *  studentName: string,
 *  email: string,
 *  markerName: string,
 *  fileId: number,
 *  fileName: string
 *  grade: number | null,
 * }[]>}
 */
export function getAllSubmissions(assignmentId, navigate) {
  return sendAuthenticatedRequest(`/api/assignment/submissions/${assignmentId}`, navigate);
}

/**
 * Update mark visibility of assignment
 * @param {number} assignmentId
 * @param {boolean} releaseMarks
 * @param {NavigateFunction} navigate
 * @returns {Promise}
 */
export function updateReleaseMarks(assignmentId, releaseMarks, navigate) {
  return sendAuthenticatedRequest(
    `/api/assignment/release`,
    navigate,
    'PUT',
    {
      'Content-Type': 'application/json',
    },
    JSON.stringify({
      assignmentId,
      releaseMarks,
    })
  );
}
