import { sendAuthenticatedRequest } from '../helpers';

/**
 * Creates material in course with courseId if materiaLId is undefined.
 * Otherwise, updates material.
 * @param {number} materialId
 * @param {number} courseId
 * @param {string} materialName
 * @param {string} description
 * @param {File[]} files
 * @param {boolean} shouldNotifyStudents
 * @param {NavigateFunction} navigate
 * @returns {Promise<{materialId?: number}>}
 */
export function createOrUpdateMaterial(
  materialId,
  courseId,
  materialName,
  description,
  files,
  shouldNotifyStudents,
  navigate
) {
  const formData = new FormData();
  files.forEach((file, idx) => {
    formData.append('files', file);
  });
  formData.append('materialName', materialName);
  formData.append('description', description);
  formData.append('courseId', parseInt(courseId, 10));
  formData.append('materialId', materialId ? parseInt(materialId, 10) : 0);
  formData.append('shouldNotifyStudents', shouldNotifyStudents);
  return sendAuthenticatedRequest(
    `/api/material`,
    navigate,
    materialId ? 'PUT' : 'POST',
    {},
    formData
  );
}

/**
 * Gets all teaching materials for the course
 * @param {number} courseId
 */
export function getMaterials(courseId, navigate) {
  return sendAuthenticatedRequest(`/api/materials/${courseId}`, navigate);
}

/**
 * Gets material with given materialId
 * @param {number} materialId
 * @param {NavigateFunction} navigate
 * @return {Promise<{
 *  materialName: string,
 *  description: string,
 *  timeCreated: number
 *  files: {fileId: number, fileName: string}[]
 * }>}
 */
export function getMaterial(materialId, navigate) {
  return sendAuthenticatedRequest(`/api/material/${materialId}`, navigate);
}

/**
 * Deletes material with materialId
 * @param {number} materialId
 * @param {NavigateFunction} navigate
 */
export function deleteMaterial(materialId, navigate) {
  return sendAuthenticatedRequest(`/api/material/${materialId}`, navigate, 'DELETE');
}
