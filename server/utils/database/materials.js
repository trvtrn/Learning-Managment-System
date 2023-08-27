const DBHandler = require('./handler');

class MaterialDBHandler extends DBHandler {
  constructor(db, fileHandler, courseHandler) {
    super(db);
    this.fileHandler = fileHandler;
    this.courseHandler = courseHandler;
  }
  /**
   * Checks whether a teaching material with the given ID exists in the database.
   * @param {number} materialId - the teaching material ID
   * @returns {boolean}
   */
  doesMaterialExist = (materialId) => {
    return (
      this.db.prepare('SELECT * FROM teachingMaterials WHERE id = ?').get(materialId) !== undefined
    );
  };

  /**
   * Delete all files associated with the given material in the database.
   * @param {number} materialId - ID of the teaching material
   */
  deleteMaterialFiles = (materialId) => {
    this.db
      .prepare(
        'DELETE FROM files WHERE fileGroupId IN (SELECT fileGroupId FROM teachingMaterials WHERE id = ?)'
      )
      .run(materialId);
  };

  /**
   * Returns an array of all teaching materials for the given course as (id, name) pairs from the database.
   * If the course does not exist, return undefined.
   * @param {number} courseId - ID of the course
   * @returns {{number, string}[]} - the teaching materials
   */
  getAllTeachingMaterials = (courseId) => {
    return this.db
      .prepare(
        'SELECT id AS materialId, name AS materialName, timeCreated, description FROM teachingMaterials WHERE courseId = ?'
      )
      .all(courseId);
  };

  /**
   * Returns the name, description, and paths of files associated to the material with the given ID,
   * in the database.
   * @param {number} materialId - ID of the teaching material
   * @returns {{string, string, string[]}} - the teaching material
   */
  getTeachingMaterial = (materialId) => {
    const material = this.db
      .prepare(
        'SELECT name, description, timeCreated, fileGroupId FROM teachingMaterials WHERE id = ?'
      )
      .get(materialId);
    const files = this.db
      .prepare('SELECT id, name, filePath FROM files WHERE fileGroupId = ?')
      .all(material.fileGroupId);

    return {
      materialName: material.name,
      description: material.description,
      timeCreated: material.timeCreated,
      files: files.map((file) => ({
        fileId: file.id,
        fileName: file.name,
        filePath: file.filePath,
      })),
    };
  };

  /**
   * Adds a teaching material with the given name, description and files to the given course in the database.
   * Returns the ID of the newly added material.
   * @param {number} courseId - ID of the course
   * @param {string} materialName - name of the material
   * @param {string} description - material description
   * @param {Express.Multer.File[]} files - array of files pairs
   * @returns {number} - ID of the material
   */
  addTeachingMaterial = (courseId, materialName, description, files) => {
    const materialId = this.db
      .prepare(
        'INSERT INTO teachingMaterials (name, courseId, description, fileGroupId, timeCreated) VALUES(?, ?, ?, ?, ?)'
      )
      .run(
        materialName,
        courseId,
        description,
        this.fileHandler.saveFiles(files),
        Date.now()
      ).lastInsertRowid;

    return materialId;
  };

  /**
   * Deletes the teaching material with the given ID from the database.
   * Also deletes all files associated with the teaching material.
   * @param {number} materialId - ID of the teaching material
   */
  deleteTeachingMaterial = (materialId) => {
    this.deleteMaterialFiles(materialId);
    this.db.prepare('DELETE FROM teachingMaterials WHERE id = ?').run(materialId);
  };

  /**
   * Update the material in the database with the given ID with a new description and files.
   * @param {number} materialId - ID of the material
   * @param {string} description - the new description
   * @param {Express.Multer.File[]} files - array of new files as (name, blob) pairs
   */
  updateTeachingMaterial = (materialId, name, description, files) => {
    const fileGroupId = this.db
      .prepare('SELECT fileGroupId FROM teachingMaterials WHERE id = ?')
      .get(materialId).fileGroupId;
    this.fileHandler.saveFiles(files, fileGroupId);

    this.db
      .prepare(
        'UPDATE teachingMaterials SET name = ?, description = ?, timeCreated = ? WHERE id = ?'
      )
      .run(name, description, Date.now(), materialId);
  };

  /**
   * Returns the course containing the given material in the database.
   * Assumes that such a material exists.
   * @param {number} materialId the material ID
   * @returns {number} the ID of the course containing the material
   */
  getCourseOfMaterial = (materialId) => {
    return this.db.prepare('SELECT courseId FROM teachingMaterials WHERE id = ?').get(materialId)
      .courseId;
  };

  /**
   * Returns whether the given user can view the given material in the database.
   * Assumes that such a user and material exists.
   * @param {number} userId the user ID
   * @param {number} materialId the material ID
   * @returns {boolean}
   */
  canUserViewMaterial = (userId, materialId) => {
    return this.courseHandler.isUserEnrolledIn(userId, this.getCourseOfMaterial(materialId));
  };

  /**
   * Returns whether the given user can update or delete the given material in the database.
   * Assumes that such a user and material exists.
   * @param {number} userId the user ID
   * @param {number} materialId the material ID
   * @returns {boolean}
   */
  canUserEditMaterial = (userId, materialId) => {
    return this.courseHandler.isUserEducatorOf(userId, this.getCourseOfMaterial(materialId));
  };
}

module.exports = MaterialDBHandler;
