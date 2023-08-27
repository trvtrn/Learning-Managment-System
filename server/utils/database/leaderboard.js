const { BADGE_CODE_LENGTH, BADGE_CODE_ALPHABET } = require('../constants');
const DBHandler = require('./handler');

class LeaderboardDBHandler extends DBHandler {
  constructor(db) {
    super(db);
  }

  /**
   * Returns the students of the given course from best to worst in terms of achievement counts.
   * Each member's rank, ID, names, email, and counts for each type of achievement are returned.
   * @param {number} courseId ID of the course
   * @returns {{
   *  rank: number,
   *  userId: number,
   *  firstName: string,
   *  lastName: string,
   *  email: string,
   *  gold: number,
   *  silver: number,
   *  bronze: number,
   * }[]} array of member names and achievement counts in ranking order
   */
  getLeaderboardOverview = (courseId) => {
    return (
      this.db
        .prepare(
          'SELECT userId, firstName, lastName, email, gold, silver, bronze, ' +
            'RANK() OVER(ORDER BY gold DESC, silver DESC, bronze DESC) rank ' +
            'FROM (SELECT e.userId, firstName, lastName, email, ' +
            "COUNT(CASE WHEN b.type = 'Gold' THEN 1 ELSE null END) AS gold, " +
            "COUNT(CASE WHEN b.type = 'Silver' THEN 1 ELSE null END) AS silver, " +
            "COUNT(CASE WHEN b.type = 'Bronze' THEN 1 ELSE null END) AS bronze " +
            'FROM enrollments e ' +
            'JOIN users u ON u.id = e.userId ' +
            'LEFT JOIN achievementOwnerships bo ON u.id = bo.userId ' +
            'LEFT JOIN achievements b ON b.id = bo.achievementId ' +
            "WHERE e.courseId = ? AND e.role = 'Student' " +
            'GROUP BY e.userId) ' +
            'ORDER BY rank ASC, userId ASC'
        )
        .all(courseId) || []
    );
  };

  /**
   * Returns all achievements obtained by the user in the given course.
   * The name and type of each achievement is returned.
   * @param {number} courseId ID of the course
   * @param {number} userId ID of the user
   * @returns {{
   *  achievementCode: string,
   *  achievementName: string,
   *  type: string,
   * }[]} the achievements
   */
  getUserAchievements = (courseId, userId) => {
    return (
      this.db
        .prepare(
          'SELECT b.name AS achievementName, b.type AS type, b.code as achievementCode ' +
            'FROM achievementOwnerships ' +
            'JOIN achievements b ON b.id = achievementId ' +
            'WHERE b.courseId = ? AND userId = ?'
        )
        .all(courseId, userId) || []
    );
  };

  /**
   * Add the achievement corresponding to the code to the user's achievement collection in the given course.
   * Assumes that this code has not already been used by the user.
   * @param {number} courseId ID of the course
   * @param {number} userId ID of the user
   * @param {string} code the achievement code
   */
  redeemAchievement = (courseId, userId, code) => {
    const achievementId = this.getAchievementIdFromCode(courseId, code);
    this.db
      .prepare('INSERT INTO achievementOwnerships (userId, achievementId) VALUES (?, ?)')
      .run(userId, achievementId);
    return this.db
      .prepare('SELECT name AS achievementName, type FROM achievements WHERE id = ?')
      .get(achievementId);
  };

  /**
   * Returns all achievements in the given course, including their code, name and type.
   * @param {number} courseId ID of the course
   * @returns {{
   *  achievementCode: string,
   *  achievementName: string,
   *  type: string,
   * }[]} the achievements
   */
  getAllAchievements = (courseId) => {
    return (
      this.db
        .prepare(
          'SELECT code AS achievementCode, name AS achievementName, type FROM achievements WHERE courseId = ?'
        )
        .all(courseId) || []
    );
  };

  /**
   * Creates a new achievement with the given details to the given course.
   * Also returns the code corresponding to the newly created achievement.
   * @param {number} courseId ID of the course
   * @param {string} name the achievement name
   * @param {string} type the achievement type
   * @returns {string} the achievement code
   */
  createAchievement = (courseId, name, type) => {
    const code = this.generateNewAchievementCode(courseId);
    this.db
      .prepare('INSERT INTO achievements (courseId, name, type, code) VALUES (?, ?, ?, ?)')
      .run(courseId, name, type, code);

    return code;
  };

  /**
   * Deletes the achievement corresponding to the given code in the given course.
   * All members that previously owned this achievement will no longer own this achievement.
   * @param {number} courseId ID of the course
   * @param {string} code the achievement code
   */
  deleteAchievement = (courseId, code) => {
    this.db
      .prepare('DELETE FROM achievements WHERE id = ?')
      .run(this.getAchievementIdFromCode(courseId, code));
  };

  /**
   * Updates the name and type of the achievement corresponding to the given code in the given course.
   * @param {number} courseId ID of the course
   * @param {string} code the achievement code
   * @param {string} name the new achievement name
   * @param {string} type the new achievement type
   */
  updateAchievement = (courseId, code, name, type) => {
    this.db
      .prepare('UPDATE achievements SET name = ?, type = ? WHERE courseId = ? AND code = ?')
      .run(name, type, courseId, code);
  };

  /**
   * Returns whether the given achievement exists in the given course.
   * @param {number} courseId ID of the course
   * @param {string} code the achievement code
   * @returns {boolean}
   */
  doesAchievementExist = (courseId, code) => {
    return this.getAchievementIdFromCode(courseId, code) !== undefined;
  };

  /**
   * Returns whether the given user owns the given achievement in the given course.
   * @param {number} courseId ID of the course
   * @param {number} userId ID of the user
   * @param {string} code the achievement code
   * @returns {boolean}
   */
  hasUserRedeemedAchievement = (courseId, userId, code) => {
    return (
      this.db
        .prepare('SELECT * FROM achievementOwnerships WHERE userId = ? AND achievementId = ?')
        .get(userId, this.getAchievementIdFromCode(courseId, code)) !== undefined
    );
  };

  /**
   * Returns the ID of the achievement corresponding to the given code in the given course.
   * @param {number} courseId ID of the course
   * @param {string} code the achievement code
   * @returns {number} ID of the achievement
   */
  getAchievementIdFromCode = (courseId, code) => {
    return this.db
      .prepare('SELECT id FROM achievements WHERE courseId = ? AND code = ?')
      .get(courseId, code)?.id;
  };

  /**
   * Returns a randomly generated achievement code that is unique to the given course.
   * @param {number} courseId ID of the course
   * @returns {string} the new achievement code
   */
  generateNewAchievementCode = (courseId) => {
    do {
      var code = '';
      for (var i = 0; i < BADGE_CODE_LENGTH; ++i) {
        code += BADGE_CODE_ALPHABET.charAt(Math.floor(Math.random() * BADGE_CODE_ALPHABET.length));
      }
    } while (this.doesAchievementExist(courseId, code));

    return code;
  };
}

module.exports = LeaderboardDBHandler;
