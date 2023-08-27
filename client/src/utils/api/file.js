import { sendAuthenticatedRequest } from '../helpers';

/**
 * Downloads all given files from the server
 * @param {{fileId: number, fileName: string}[]} files
 * @param {NavigateFunction} navigate
 * @returns {Promise<File[]>}
 */
export function getAllFiles(files, navigate) {
  return Promise.all(
    files.map(({ fileId, fileName }) => {
      return sendAuthenticatedRequest(`/api/file/download/${fileId}`, navigate).then((blob) => {
        return new File([blob], fileName);
      });
    })
  );
}

/**
 * Downloads the given file with the given name
 * @param {File | Blob} fileOrBlob
 * @param {string} fileName
 */
export function saveFile(fileOrBlob, fileName) {
  const url = window.URL.createObjectURL(fileOrBlob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${fileName}`;
  a.click();
}

/**
 * Downloads the file with the given file id
 * @param {number} fileId
 * @param {NavigateFunction} navigate
 */
export function downloadAndSaveFile(fileId, fileName, navigate) {
  sendAuthenticatedRequest(`/api/file/download/${fileId}`, navigate)
    .then((blob) => {
      saveFile(blob, fileName);
    })
    .catch((err) => console.error(err.message));
}

/**
 * Upload file to server
 * @param {File} file
 * @param {NavigateFunction} navigate
 * @returns {Promise<{fileId: number}>}
 */
export function uploadFile(file, navigate) {
  const formData = new FormData();
  formData.append('file', file);
  return sendAuthenticatedRequest('/api/file', navigate, 'POST', {}, formData);
}
