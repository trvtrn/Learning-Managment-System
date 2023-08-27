const jwt = require('jsonwebtoken');
const DBHandler = require('./handler');

class AuthDBHandler extends DBHandler {
  constructor(db) {
    super(db);
  }
  /**
   * Adds a new user to the database
   * @param {string} firstName - the user's first name
   * @param {string} lastName - the user's last name
   * @param {string} email - the user's email
   * @param {string} hashedPassword - the user's password hashed using bcrypt
   * @returns {number} - the user's userId
   */
  addNewUser = (firstName, lastName, email, hashedPassword) => {
    return this.db
      .prepare('INSERT INTO users (firstName, lastName, email, password) VALUES(?, ?, ?, ?)')
      .run(firstName, lastName, email, hashedPassword).lastInsertRowid;
  };

  /**
   * Checks whether a user already exists in the database with the given email
   * @param {String} email - the user email
   * @param {Database} db - the database
   * @returns {Number} true/false
   */
  emailAlreadyRegistered = (email) => {
    return this.db.prepare('SELECT id FROM users WHERE email = ?').get(email) !== undefined;
  };

  /**
   * Gets user's userId, firstName, lastName and email using userId
   * @param {string} userId - the user's id
   * @returns {number} userId - the user's id
   * @returns {{string, string, string, string}[]} - userId, firstName, lastName, email
   */
  getUserDetailsById = (userId) => {
    return this.db
      .prepare('SELECT id AS userId, firstName, lastName, email FROM users WHERE id = ?')
      .get(userId);
  };

  /**
   * Checks whether a user already exists in the database with the given email
   * @param {string} email - the user email
   * @returns {number} userId - the user's id
   */
  getUserIdByEmail = (email) => {
    return this.db.prepare('SELECT id FROM users WHERE email = ?').get(email)?.id;
  };

  /**
   * Checks whether a user already exists by email and returns the hashedpassword
   * @param {string} email - the user email
   * @returns {string} password - the user's hashed password
   */
  getPasswordByEmail = (email) => {
    return this.db.prepare('SELECT password FROM users WHERE email = ?').get(email).password;
  };

  /**
   * Deletes a user
   * @param {number} userId - user to delete
   * @returns {boolean} - returns true if user was deleted
   */
  deleteUser = (userId) => {
    return this.db.prepare('DELETE FROM users WHERE id = ?').run(userId).changes > 0;
  };

  /**
   * Deletes all password reset tokens for a user
   * @param {number} userId - user to delete
   * @returns {number} - returns the number of tokens deleted
   */
  deletePasswordTokens = (userId) => {
    return this.db.prepare('DELETE FROM passwordResetTokens WHERE userId = ?').run(userId).changes;
  };

  /**
   * Adds a password reset token for a user
   * @param {number} userId
   * @param {string} hashedToken - hashedtoken generated with bcrypt
   * @returns {boolean} - returns the number of tokens added
   */
  storePasswordResetToken = (userId, hashedToken) => {
    return this.db
      .prepare('INSERT INTO passwordResetTokens (userId, token) VALUES(?, ?)')
      .run(userId, hashedToken).changes;
  };

  /**
   * Adds a password reset token for a user
   * @param {number} userId
   * @returns {string} - returns the hashedToken or null if error
   */
  getPasswordResetToken = (userId) => {
    try {
      const hashedToken = this.db
        .prepare('SELECT token FROM passwordResetTokens WHERE userId = ?')
        .get(userId).token;
      return hashedToken;
    } catch (error) {
      return null;
    }
  };

  /**
   * Update password for a user
   * @param {number} userId
   * @returns {boolean} - returns true if successful
   */
  updateUserPassword = (userId, password) => {
    if (
      this.db.prepare('UPDATE users SET password = ? WHERE id = ?').run(password, userId).changes
    ) {
      return true;
    }
    return false;
  };
  /**
   * Returns the ID of the user with the given email in the database.
   * If no such user exists, return undefined.
   * @param {string} email - email of the user
   * @returns {number} - ID of the user
   */
  getIdOfUserWithEmail = (email) => {
    return this.db.prepare('SELECT id FROM users WHERE email = ?').get(email)?.id;
  };

  /**
   * Returns whether a user with given ID exists in the database.
   * @param {number} userId - ID of the user
   * @returns {boolean}
   */
  doesUserExist = (userId) => {
    return this.db.prepare('SELECT 1 FROM users WHERE id = ?').get(userId) != undefined;
  };
}
module.exports = AuthDBHandler;
