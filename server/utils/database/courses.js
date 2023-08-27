const DBHandler = require('./handler');

class CourseDBHandler extends DBHandler {
  constructor(db, authHandler) {
    super(db);
    this.authHandler = authHandler;
  }
  /**
   * Enrols the given user with their role to the given course in the database.
   * @param {number} userId - ID of the user
   * @param {string} role - role of the user
   * @param {number} courseId - ID of the course
   */
  enrolUserInCourse = (userId, role, courseId) => {
    this.db
      .prepare('INSERT INTO enrollments (courseId, userId, role) VALUES (?, ?, ?)')
      .run(courseId, userId, role);
  };

  /**
   * Checks whether the user is enrolled in a course
   * @param {number} userId id of user
   * @param {number} courseId id of course
   * @returns true if user is enrolled in the course, false otherwise
   */
  isUserEnrolledIn = (userId, courseId) => {
    return (
      this.db
        .prepare('SELECT * FROM enrollments WHERE userId = ? AND courseId = ?')
        .get(userId, courseId) !== undefined
    );
  };

  /**
   * Checks whether the user is an educator of a course
   * @param {number} userId id of user
   * @param {number} courseId id of course
   * @returns true if user is educator of the course, false otherwise
   */
  isUserEducatorOf = (userId, courseId) => {
    const role = this.db
      .prepare('SELECT role FROM enrollments WHERE userId = ? AND courseId = ?')
      .get(userId, courseId)?.role;
    return role === 'Educator' || role === 'Creator';
  };

  /**
   * Checks whether the user is an educator of a course
   * @param {number} userId id of user
   * @param {number} courseId id of course
   * @returns true if user is educator of the course, false otherwise
   */
  isUserCreatorOf = (userId, courseId) => {
    return (
      this.db
        .prepare('SELECT role FROM enrollments WHERE courseId = ? AND userId = ?')
        .get(courseId, userId)?.role === 'Creator'
    );
  };

  /**
   * Checks whether a course with the given ID exists in the database.
   * @param {number} courseId - the course ID
   * @returns {boolean}
   */
  doesCourseExist = (courseId) => {
    return this.db.prepare('SELECT * FROM courses WHERE id = ?').get(courseId) !== undefined;
  };

  /**
   * Return the courses that the given user is enrolled in, as (id, name) pairs, in the database.
   * If no such user exists, return undefined.
   * @param {number} userId - ID of the user
   * @returns {{number, string}[]} - the courses
   */
  getAllCoursesForUser = (userId) => {
    return this.db
      .prepare(
        'SELECT courseId, name AS courseName, firstName, lastName ' +
          'FROM courses c ' +
          'JOIN enrollments e1 ON e1.courseId = c.id ' +
          'JOIN users u ON u.id = e1.userId ' +
          "WHERE e1.role = 'Creator' " +
          'AND EXISTS (SELECT * FROM enrollments e2 WHERE c.id = e2.courseId AND e2.userId = ?)'
      )
      .all(userId);
  };

  /**
   * Add a new course with the given name and members as (email, role) pairs.
   * Returns the ID of the newly added course.
   * @param {string} courseName - name of the new course
   * @param {{string, string}[]} members - the course members
   * @returns {number} - the ID of the new course
   */
  addCourse = (courseName, members, creatorId) => {
    const courseId = this.db
      .prepare('INSERT INTO courses (name) VALUES (?) RETURNING id')
      .get(courseName).id;
    members.forEach((member) =>
      this.enrolUserInCourse(
        this.authHandler.getIdOfUserWithEmail(member.email),
        member.role,
        courseId
      )
    );
    this.enrolUserInCourse(creatorId, 'Creator', courseId);

    return courseId;
  };

  /**
   * Unenrols all users part of the given course in the database.
   * @param {number} courseId - ID of the course
   */
  unenrolAllUsersFromCourse = (courseId, shouldRemoveCreator) => {
    this.db
      .prepare(
        'DELETE FROM enrollments WHERE courseId = ?' +
          (shouldRemoveCreator ? '' : "AND role != 'Creator'")
      )
      .run(courseId);
  };

  /**
   * Deletes the course with given ID.
   * @param {number} courseId - ID of the course
   */
  deleteCourse = (courseId) => {
    this.db.prepare('DELETE FROM courses WHERE id = ?').run(courseId);
  };

  /**
   * Gets the course name, and creator's first and last name of the given course.
   * @param {number} courseId - ID of the course
   * @returns {{
   *  courseName: string,
   *  firstName: string,
   *  lastName: string
   * }} - the course name and creators first and last name
   */
  getCourse = (courseId) => {
    return this.db
      .prepare(
        'SELECT name as courseName, firstName, lastName ' +
          'FROM courses c ' +
          "JOIN enrollments e ON courseId = c.id AND e.role = 'Creator' " +
          'JOIN users u ON userId = u.id ' +
          'WHERE c.id = ?'
      )
      .get(courseId);
  };

  /**
   * Updates course of the given id to the new course name
   * @param {number} courseId - ID of the course
   * @param {string} courseName
   */
  updateCourse = (courseId, courseName) => {
    this.db.prepare('UPDATE courses SET name = ? WHERE courses.id = ?').run(courseName, courseId);
  };
}

module.exports = CourseDBHandler;
