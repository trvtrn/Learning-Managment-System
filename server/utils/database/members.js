const DBHandler = require('./handler');
const { sendEmail } = require('../helpers');

class MemberDBHandler extends DBHandler {
  constructor(db, authHandler, courseHandler) {
    super(db);
    this.authHandler = authHandler;
    this.courseHandler = courseHandler;
  }

  /**
   * Returns the details of all members of the given course in the database.
   * @param {number} courseId - ID of the course
   * @returns {{number, string, string, string, string}[]} - user Id, email, first/last names of the members, role
   */
  getAllMembersOfCourse = (courseId) => {
    return this.db
      .prepare(
        'SELECT id AS userId, email, firstName, lastName, role FROM users INNER JOIN enrollments ON users.id = enrollments.userId WHERE courseId = ?'
      )
      .all(courseId);
  };

  /**
   * Adds the given members to the given course in the database.
   * Adding an already enrolled member does nothing and is not an error.
   * @param {number} courseId - ID of the course
   * @param {{number, string}[]} members - the new members as {email, role} pairs
   */
  addMembersToCourse = (courseId, members) => {
    members.forEach((member) => {
      const memberId = this.authHandler.getIdOfUserWithEmail(member.email);
      if (!this.courseHandler.isUserEnrolledIn(memberId, courseId)) {
        this.courseHandler.enrolUserInCourse(memberId, member.role, courseId);
      }
    });
  };

  /**
   * Removes the given user from the course.
   * @param {number} courseId - ID of the course
   * @param {number} userId - ID of the user
   */
  deleteMemberFromCourse = (courseId, userId) => {
    this.db
      .prepare('DELETE FROM enrollments WHERE courseId = ? AND userId = ?')
      .run(courseId, userId);
  };

  /**
   * Returns the role of the user in the given course in the database.
   * @param {number} courseId - ID of the course
   * @param {number} userId - ID of the user
   * @returns {string} - role of the user in course
   */
  getMemberRoleInCourse = (courseId, userId) => {
    return this.db
      .prepare('SELECT role FROM enrollments WHERE userId = ? AND courseId = ?')
      .get(userId, courseId).role;
  };

  /**
   * Update the given user with the new role in the given course in the database.
   * @param {number} courseId - ID of the course
   * @param {number} userId - ID of the user
   * @param {number} role - new role of the user
   * @param {Databse} db - the database
   */
  updateUserRoleInCourse = (courseId, userId, role) => {
    this.db
      .prepare('UPDATE enrollments SET role = ? WHERE userId = ? AND courseId = ?')
      .run(role, userId, courseId);
  };

  /**
   * Sends an email to all users in a course
   * If there is no such user or course, or the user is not in the course, return a failure status and the appropriate message.
   * Otherwise, return a success status.
   * @param {number} courseId - ID of the course
   * @param {string} emailSubject - the subject line for the email
   * @param {JSON} payload - contains data to be parsed into the email html template
   * @param {string} template - the path of the email template to be used
   * @param {Databse} db - the database
   */
  emailAllMembersInCourse = (courseId, emailSubject, payload, template) => {
    if (!this.courseHandler.doesCourseExist(courseId)) {
      return;
    }
    const members = this.getAllMembersOfCourse(courseId);

    members.forEach((member) => {
      sendEmail(member.email, emailSubject, { name: member.firstName, ...payload }, template);
    });
  };

  /**
   * Gets all member details of the given course with the given userIds
   * If a user is not enrolled, their role is returned as null
   * @param {number} courseId
   * @param {number[]} userId
   * @param {{
   *  userId: number,
   *  firstName: string,
   *  lastName: string,
   *  role: string | null
   * }[]}
   */
  getMembersDetails = (courseId, userIds) => {
    return (
      this.db
        .prepare(
          'SELECT id AS userId, firstName, lastName, email, e.role FROM users ' +
            'LEFT JOIN enrollments e ON e.userId = id AND e.courseId = ?' +
            `WHERE id IN (${Array(userIds.length).fill('?').join(', ')}) `
        )
        .all(courseId, ...userIds) || []
    );
  };
}

module.exports = MemberDBHandler;
