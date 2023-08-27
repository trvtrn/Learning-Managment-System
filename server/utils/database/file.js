const DBHandler = require('./handler');

class FileDBHandler extends DBHandler {
  constructor(db) {
    super(db);
  }
  /**
 * Returns the next usable file group ID in the database.
 
 * @returns {number} - the next ID
 */
  getNextFileGroupId = () => {
    return (
      this.db.prepare('UPDATE fileGroupIdCounter SET counter = counter + 1 RETURNING counter').get()
        .counter + 1
    );
  };

  /**
   * Adds a file with the given name and contents to the specified file group in the database.
   * Also stores the file locally with the name as the ID of the new file.
   * @param {string} fileName - name of the file
   * @param {string} blob - file contents
   * @param {number} fileGroupId - ID of the file group
   */
  addFileToGroup = (fileName, filePath, fileGroupId) => {
    return this.db
      .prepare('INSERT INTO files (name, fileGroupId, filePath) VALUES(?, ?, ?) RETURNING id')
      .get(fileName, fileGroupId, filePath).id;
  };

  /**
   * Returns the file path for the given file id, and undefined if the file does not exist.
   * @param {number} fileId
   * @returns {string}
   */
  getFilePath = (fileId) => {
    return this.db.prepare('SELECT filePath from files where id = ?').get(fileId)?.filePath;
  };

  /**
   * Deletes all files from the given file group id.
   * @param {number} fileGroupId
   */
  deleteFiles = (fileGroupId) => {
    this.db.prepare('DELETE FROM files WHERE fileGroupId = ?').run(fileGroupId);
  };

  saveFiles = (files, fileGroupId) => {
    if (!fileGroupId) {
      fileGroupId = this.getNextFileGroupId();
    } else {
      this.deleteFiles(fileGroupId);
    }
    files.forEach((file) => this.addFileToGroup(file.originalname, file.path, fileGroupId));
    return fileGroupId;
  };
}
module.exports = FileDBHandler;
