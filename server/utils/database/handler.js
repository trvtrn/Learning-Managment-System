/**
 * Database handler base class
 */
class DBHandler {
  /**
   * @param {Database} this.db
   */
  constructor(db) {
    this.db = db;
  }
}

module.exports = DBHandler;
