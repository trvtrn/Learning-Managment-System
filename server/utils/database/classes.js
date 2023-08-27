const { getNextEnd, getStartForEnd } = require('../helpers');
const DBHandler = require('./handler');
class ClassDBHandler extends DBHandler {
  constructor(db) {
    super(db);
  }

  /**
   * Returns true if the class exists
   * @param {number} classId
   * @returns {boolean}
   */
  doesClassExist = (classId) => {
    return this.db.prepare('SELECT * FROM onlineClasses WHERE id = ?').get(classId) !== undefined;
  };

  getClassName = (classId) => {
    return this.db.prepare('SELECT name FROM onlineClasses WHERE id = ?').get(classId)?.name;
  };

  getClass = (classId) => {
    return this.db.prepare('SELECT * FROM onlineClasses where id = ?').get(classId);
  };

  updateClass = (classId, className, startTime, endTime, frequency) => {
    this.db
      .prepare(
        'UPDATE onlineClasses SET name = ?, startTime = ?, endTime = ?, frequency = ? WHERE id = ?'
      )
      .run(className, startTime, endTime, frequency, classId);
  };

  addClass = (courseId, className, startTime, endTime, frequency) => {
    return this.db
      .prepare(
        'INSERT INTO onlineClasses(courseId, name, startTime, endTime, frequency) VALUES (?, ?, ?, ?, ?) RETURNING id'
      )
      .get(courseId, className, startTime, endTime, frequency).id;
  };

  getClasses = (courseId) => {
    return (
      this.db
        .prepare(
          'SELECT id as classId, name as className, startTime, endTime, frequency FROM onlineClasses WHERE courseId = ?'
        )
        .all(parseInt(courseId)) || []
    );
  };
  deleteClass = (classId) => {
    this.db.prepare('DELETE FROM messages where onlineClassId = ?').run(classId);
    this.db.prepare('DELETE FROM onlineClasses WHERE id = ?').run(classId);
  };

  getMessagesFromClass = (classId) => {
    const courseId = this.getCourseForClass(classId);
    return (
      this.db
        .prepare(
          'SELECT m.id as messageId, u.id as userId, u.firstName as firstName, ' +
            'u.lastName as lastName, m.timeSent as timeSent, m.text as text ' +
            'FROM messages m JOIN users u ON m.userId = u.id ' +
            'JOIN enrollments e ON e.courseId = ? AND e.userId = u.id ' +
            'WHERE m.onlineClassId = ?'
        )
        .all(courseId, classId) || []
    );
  };

  /**
   * Returns the courseId of a class
   * @param {number} classId id of class
   * @returns {number} the courseId of the given class, -1 if the class is not associated with any course
   */
  getCourseForClass = (classId) => {
    return (
      this.db.prepare('SELECT courseId FROM onlineClasses WHERE id = ?').get(classId)?.courseId ||
      -1
    );
  };

  /**
   * Returns whether a class is in session or not
   * @param {number} classId
   * @returns {boolean}
   */
  isClassInSession = (classId) => {
    const classInfo = this.getClass(classId);
    const nextEnd = getNextEnd(new Date(classInfo.endTime), classInfo.frequency);
    const nextOrCurrentStart = getStartForEnd(
      new Date(classInfo.startTime),
      nextEnd,
      classInfo.frequency
    );
    return nextOrCurrentStart <= Date.now() && Date.now() <= nextEnd;
  };

  /**
   * Adds a new message from the given user to the given class and
   * returns the message id
   * @param {number} classId
   * @param {number} userId
   * @param {number} timeSent
   * @param {string} text
   * @returns {number}
   */
  addMessageToClass = (classId, userId, timeSent, text) => {
    return this.db
      .prepare(
        'INSERT INTO messages(onlineClassId, userId, timeSent, text) VALUES (?, ?, ?, ?) RETURNING id'
      )
      .get(classId, userId, timeSent, text).id;
  };
}
module.exports = ClassDBHandler;
