const DBHandler = require('./handler');

class AssignmentDBHandler extends DBHandler {
  constructor(db, fileHandler) {
    super(db);
    this.fileHandler = fileHandler;
  }
  /**
   * Adds an assignment with the given details to the given course in the database.
   * @param {number} courseId - ID of the course
   * @param {string} assignmentName - name of the assignment
   * @param {number} releaseDate - release date of the assignment
   * @param {number} dueDate - date the assignment is due
   * @param {number} totalMarks - the maximum possible mark
   * @param {string} description - assignment description
   * @param {Express.Multer.File[]} files - array of files
   * @param {number} weighting - the assignment weighting (0-100)
   * @returns {{assignmentId: number}}
   */
  createAssignment = (
    courseId,
    assignmentName,
    description,
    releaseDate,
    dueDate,
    totalMarks,
    files,
    weighting
  ) => {
    const assignmentId = this.db
      .prepare(
        'INSERT INTO assignments (courseId, name, description, fileGroupId, releaseDate, dueDate, totalMarks, weighting, marksReleased) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?)'
      )
      .run(
        courseId,
        assignmentName,
        description,
        this.fileHandler.saveFiles(files),
        releaseDate,
        dueDate,
        totalMarks,
        weighting,
        0
      ).lastInsertRowid;

    return { assignmentId };
  };

  /**
   * Checks whether an assignment with the given ID exists in the database.
   * @param {number} assignmentId - the assignment ID
   * @returns {boolean} - whether the assignment exists
   */
  doesAssignmentExist = (assignmentId) => {
    return (
      this.db.prepare('SELECT * FROM assignments WHERE id = ?').get(assignmentId) !== undefined
    );
  };

  /**
   * Returns all information and files for an assignment
   * @param {number} assignmentId - the assignment ID
   * @returns {{
   *   assignmentName: string,
   *   description: string,
   *   dueDate: number,
   *   totalMarks: number,
   *   releaseDate: number,
   *   weighting: number,
   *   files: {fileId: number, fileName: string}[]
   * }} - the assignment material
   */
  getAssignment = (assignmentId) => {
    const {
      marksReleased,
      assignmentName,
      description,
      fileGroupId,
      dueDate,
      totalMarks,
      weighting,
      releaseDate,
    } = this.db
      .prepare(
        'SELECT marksReleased, name as assignmentName, description, fileGroupId, ' +
          'dueDate, totalMarks, weighting, releaseDate ' +
          'FROM assignments WHERE id = ?'
      )
      .get(assignmentId);

    return {
      marksReleased: marksReleased === 1 ? true : false,
      assignmentName,
      description,
      dueDate,
      totalMarks,
      weighting,
      releaseDate,
      files:
        this.db
          .prepare('SELECT id AS fileId, name AS fileName FROM files WHERE fileGroupId = ?')
          .all(fileGroupId) || [],
    };
  };

  /**
   * Gets key information for all assignments in a course
   * @param {number} courseId - the course ID
   * @returns {{
   *   assignmentId: number,
   *   assignmentName: string,
   *   dueDate: number,
   *   releaseDate: number
   * }}
   */
  getAssignmentsOverviewForCourse = (courseId) => {
    return this.db
      .prepare(
        'SELECT id as assignmentId, name as assignmentName, dueDate, releaseDate FROM assignments WHERE courseId = ?'
      )
      .all(courseId);
  };

  /**
   * Updates an assignment with the given details
   * @param {string} assignmentName - name of the assignment
   * @param {number} releaseDate - release date of the assignment
   * @param {number} dueDate - date the assignment is due
   * @param {number} totalMarks - the maximum possible mark
   * @param {string} description - assignment description
   * @param {Express.Multer.File[]} files - array of files
   * @param {number} weighting - the assignment weighting (0-100)
   */
  updateAssignment = (
    assignmentId,
    assignmentName,
    description,
    releaseDate,
    dueDate,
    totalMarks,
    files,
    weighting
  ) => {
    // Update assignment information
    this.db
      .prepare(
        'UPDATE assignments SET name = ?, description = ?, releaseDate = ?,' +
          'dueDate = ?, totalMarks = ?, weighting = ? ' +
          'WHERE id = ?'
      )
      .run(assignmentName, description, releaseDate, dueDate, totalMarks, weighting, assignmentId);

    // Get current fileGroupId
    const fileGroupId = this.db
      .prepare('SELECT fileGroupId FROM assignments WHERE id = ?')
      .get(assignmentId).fileGroupId;

    this.fileHandler.saveFiles(files, fileGroupId);
  };

  /**
   * Submits an assignment for a user
   * @param {number} userId - the user's ID
   * @param {number} assignmentId - the assignment ID
   * @param {Express.Multer.File[]} files - array of files
   * @returns {{ submissionId: number, submissionTime: number}}
   */
  submitAssignment = (userId, assignmentId, files) => {
    const submissionTime = Date.now();

    // check if existing submission
    let { submissionId, fileGroupId } =
      this.db
        .prepare(
          'SELECT id as submissionId, fileGroupId FROM assignmentSubmissions WHERE userId = ? AND assignmentId = ?'
        )
        .get(userId, assignmentId) || {};

    if (submissionId !== undefined) {
      // update existing submission submissionTime
      this.db
        .prepare('UPDATE assignmentSubmissions SET submissionTime = ? WHERE id = ?')
        .run(submissionTime, submissionId);
      this.fileHandler.saveFiles(files, fileGroupId);
    } else {
      submissionId = this.db
        .prepare(
          'INSERT INTO assignmentSubmissions (assignmentId, userId, fileGroupId, submissionTime) VALUES(?, ?, ?, ?)'
        )
        .run(
          assignmentId,
          userId,
          this.fileHandler.saveFiles(files),
          submissionTime
        ).lastInsertRowid;
    }

    return { submissionId, submissionTime };
  };
  /**
   * Returns true if the user has a submission for the given assignment
   * false otherwise
   * @param {number} assignmentId - the assignment ID
   * @returns {boolean}
   */
  doesUserSubmissionExistForAssignment = (userId, assignmentId) => {
    return (
      this.db
        .prepare('SELECT * FROM assignmentSubmissions WHERE userId = ? AND assignmentId = ?')
        .get(userId, assignmentId) !== undefined
    );
  };

  /**
   * Gets a student’s existing submission and results
   * @param {number} userId - the student's ID
   * @param {number} assignmentId - the assignment ID
   * @returns {{
   *   submissionId: number,
   *   mark: number,
   *   totalMarks: number,
   *   comment: string,
   * }}
   */
  getAssignmentSubmission = (userId, assignmentId) => {
    const fileGroupId = this.db
      .prepare(
        'SELECT fileGroupId FROM assignmentSubmissions WHERE userId = ? AND assignmentId = ?'
      )
      .get(userId, assignmentId).fileGroupId;

    return {
      ...this.db
        .prepare(
          'SELECT s.id as submissionId, s.mark, a.totalMarks, s.comment ' +
            'FROM assignmentSubmissions s ' +
            'JOIN assignments a ON s.assignmentId = a.id ' +
            'WHERE s.userId = ? AND s.assignmentId = ?'
        )
        .get(userId, assignmentId),
      files:
        this.db
          .prepare('SELECT id AS fileId, name AS fileName FROM files WHERE fileGroupId = ?')
          .all(fileGroupId) || [],
    };
  };

  /**
   * Returns true when an assignment submission ID exists
   * @param {number} submissionId - the submission ID
   * @returns {boolean}
   */
  doesAssignmentSubmissionExist = (submissionId) => {
    return (
      this.db.prepare('SELECT 1 FROM assignmentSubmissions WHERE id = ?').get(submissionId) !==
      undefined
    );
  };

  /**
   * Adds a mark and comment to an assignment submission
   * @param {number} mark - the mark for the assignment submission
   * @param {string} comment - the comment for the assignment submission
   * @param {number} markerId - the ID of the marker
   * @param {number} submissionId - the submission ID
   */
  markAssignment = (mark, comment, markerId, submissionId) => {
    this.db
      .prepare(
        'UPDATE assignmentSubmissions SET mark = ?, comment = ?, markedById = ? WHERE id = ?'
      )
      .run(mark, comment, markerId, submissionId);
  };

  /**
   * Releases or un-releases the marks for an assignment
   * @param {number} assignmentId - the assignment's ID
   * @param {boolean} shouldReleaseMarks - whether marks should be released or not
   */
  releaseMarks = (assignmentId, shouldReleaseMarks) => {
    const marksReleased = shouldReleaseMarks ? 1 : 0;

    this.db
      .prepare('UPDATE assignments SET marksReleased = ? WHERE id = ?')
      .run(marksReleased, assignmentId);
    return { marksReleased };
  };

  /**
   * Gets all submissions for the assignment so the teacher can view them
   * @param {number} assignmentId - the assignment's ID
   * @returns {{
   *   fileId: number,
   *   fileName: string,
   *   submissionId: number,
   *   mark: number,
   *   comment: string,
   *   studentName: string,
   *   markerName: string,
   *   email: string,
   * }}
   */
  getAllSubmissionsForAssignment = (assignmentId) => {
    return (
      this.db
        .prepare(
          "SELECT s.id as submissionId, s.comment, s.mark, f.id as fileId, f.name as fileName, u.firstName || ' ' || " +
            "u.lastName as studentName, u.email, u2.firstName || ' ' || u2.lastName as markerName " +
            'FROM assignmentSubmissions s ' +
            'JOIN users u on s.userId = u.id ' +
            'JOIN assignments a on s.assignmentId = a.id ' +
            'LEFT JOIN users u2 on s.markedById = u2.id ' +
            'LEFT JOIN files f on f.fileGroupId = s.fileGroupId ' +
            'WHERE s.assignmentId = ?'
        )
        .all(assignmentId) || []
    );
  };

  /**
   * Gets the courseId for an assignmentId
   * Returns -1 if error
   * @param {number} assignmentId - the assignment's ID
   * @returns {number}
   */
  getAssignmentCourseId = (assignmentId) => {
    const courseId = this.db
      .prepare('SELECT courseId FROM assignments WHERE id = ?')
      .get(assignmentId).courseId;

    return courseId === undefined ? -1 : courseId;
  };

  /**
   * Gets the courseId for a submissionId
   * Returns -1 if error
   * @param {number} submissionId - the assignment's ID
   * @returns {number}
   */
  getSubmissionCourseId = (submissionId) => {
    const courseId = this.db
      .prepare(
        'SELECT a.courseId FROM assignmentSubmissions s JOIN assignments a on s.assignmentId = a.id WHERE s.id = ?'
      )
      .get(submissionId).courseId;

    return courseId === undefined ? -1 : courseId;
  };

  /**
   * Deletes the assignment with the corresponding ID
   * @param {number} assignmentId - the assignment's ID
   * @returns {number} - number of assignments deleted
   */
  deleteAssignment = (assignmentId) => {
    return this.db.prepare('DELETE FROM assignments where id = ?').run(assignmentId);
  };

  /**
   * returns whether an assignment is past its deadline
   * @param {number} assignmentId - the assignment's ID
   * @returns {boolean}
   */
  isAssignmentPastDeadline = (assignmentId) => {
    return (
      this.db.prepare('SELECT dueDate FROM assignments WHERE id = ?').get(assignmentId)?.dueDate <
      Date.now()
    );
  };
}

module.exports = AssignmentDBHandler;
