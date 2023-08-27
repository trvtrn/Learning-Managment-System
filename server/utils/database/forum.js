const DBHandler = require('./handler');

class ForumDBHandler extends DBHandler {
  constructor(db, fileHandler, courseHandler) {
    super(db);
    this.fileHandler = fileHandler;
    this.courseHandler = courseHandler;
  }

  /**
   * Returns whether the given user is the creator of the given post.
   * @param {number} userId ID of the user
   * @param {number} postId ID of the post
   * @returns {boolean}
   */
  isUserCreatorOfPost = (userId, postId) => {
    return (
      this.db.prepare('SELECT userId FROM forumPosts WHERE forumPosts.id = ?').get(postId)
        ?.userId === userId
    );
  };

  /**
   * Returns the ID of the course containing the given post.
   * @param {number} postId ID of the post
   * @returns {number} ID of the course
   */
  getCourseForPost = (postId) => {
    return this.db.prepare('SELECT courseId FROM forumPosts WHERE forumPosts.id = ?').get(postId)
      ?.courseId;
  };

  /**
   * Returns whether the given category is in the given course.
   * @param {number} categoryId ID of the category
   * @param {number} courseId ID of the course
   * @returns {boolean}
   */
  isCategoryInCourse = (categoryId, courseId) => {
    return (
      this.db.prepare('SELECT courseId FROM forumCategories WHERE id = ?').get(categoryId)
        ?.courseId === courseId
    );
  };

  /**
   * Returns all posts made in the given course, each with:
   * - post ID, title, text and time posted
   * - ID, name and colour of the post category
   * - ID, first name and last name of the post creator
   * @param {number} courseId ID of the course
   * @returns the course posts
   */
  getPosts = (courseId) => {
    return (
      this.db
        .prepare(
          'SELECT p.id AS postId, c.id AS categoryId, c.name AS categoryName, text, ' +
            'c.color AS categoryColor, ' +
            'title, userId, firstName, lastName, timePosted ' +
            'FROM forumPosts p ' +
            'LEFT JOIN forumCategories c ON p.categoryId = c.id ' +
            'JOIN users u ON p.userId = u.id ' +
            'WHERE p.courseId = ?'
        )
        .all(courseId) || []
    );
  };

  /**
   * Adds a post as the given user to a course with the given details.
   * Also returns the ID of the newly created post.
   * @param {number} courseId ID of the course
   * @param {number} userId ID of the user
   * @param {string} title post title
   * @param {number} categoryId ID of the post category
   * @param {string} text post text
   * @param {Express.Multer.File[]} files the files attached to the post
   * @returns {number} ID of new post
   */
  addPost = (courseId, userId, title, categoryId, text, files) => {
    return this.db
      .prepare(
        'INSERT INTO forumPosts(courseId, userId, title, categoryId, text, fileGroupId, timePosted) VALUES (?, ?, ?, ?, ?, ?, ?) RETURNING id'
      )
      .get(courseId, userId, title, categoryId, text, this.fileHandler.saveFiles(files), Date.now())
      .id;
  };

  /**
   * Returns details for the given post, namely:
   * - title, text and time posted
   * - ID, name and colour of the post category
   * - ID, first name and last name of the post creator
   * - ID, first name and last name of the replier, and ID, time sent and text of each reply
   * - ID and name of each attached file
   * @param {number} postId ID of the post
   * @returns the post details
   */
  getPost = (postId) => {
    const { fileGroupId } = this.db
      .prepare('SELECT fileGroupId FROM forumPosts WHERE id = ?')
      .get(postId);
    return {
      ...this.db
        .prepare(
          'SELECT title,' +
            'users.id AS userId, firstName, lastName,' +
            'c.id AS categoryId, ' +
            'c.name AS categoryName,' +
            'c.color AS categoryColor,' +
            'timePosted, text ' +
            'FROM forumPosts p ' +
            'JOIN users ON users.id = userId ' +
            'LEFT JOIN forumCategories c ON c.id = p.categoryId ' +
            'WHERE p.id = ?'
        )
        .get(postId),
      replies: this.db
        .prepare(
          'SELECT r.id AS replyId, userId, firstName, lastName, timeSent, text, ' +
            "JSON_GROUP_ARRAY(JSON_OBJECT('fileId', f.id, 'fileName', f.name)) AS files " +
            'FROM forumReplies r ' +
            'JOIN users u ON u.id = userId ' +
            'LEFT JOIN files f ON f.fileGroupId = r.fileGroupId ' +
            'WHERE forumPostId = ? ' +
            'GROUP BY replyId'
        )
        .all(postId)
        .map((reply) => {
          let files = JSON.parse(reply.files);
          if (files.length === 1 && files[0].fileId === null) {
            files = [];
          }
          return { ...reply, files };
        }),
      files:
        this.db
          .prepare('SELECT id AS fileId, name AS fileName FROM files WHERE fileGroupId = ?')
          .all(fileGroupId) || [],
    };
  };

  /**
   * Returns whether the given post exists.
   * @param {number} postId ID of the post
   * @returns {boolean}
   */
  doesPostExist = (postId) => {
    return this.db.prepare('SELECT * FROM forumPosts WHERE id = ?').get(postId) !== undefined;
  };

  /**
   * Returns whether the user can update or delete the given post.
   * @param {number} userId ID of the user
   * @param {number} postId ID of the post
   * @returns {boolean}
   */
  canUserEditPost = (userId, postId) => {
    return (
      this.isUserCreatorOfPost(userId, postId) ||
      this.courseHandler.isUserEducatorOf(userId, this.getCourseForPost(postId))
    );
  };

  /**
   * Returns whether students can assign the given category for a post.
   * @param {number} categoryId ID of the category
   * @returns {boolean}
   */
  isSelectableForStudents = (categoryId) => {
    return (
      this.db
        .prepare('SELECT selectableForStudents FROM forumCategories WHERE id = ?')
        .get(categoryId)?.selectableForStudents === 1
    );
  };

  /**
   * Updates the title, category, text and attached files of the given post.
   * @param {number} postId ID of the post
   * @param {string} title post title
   * @param {number} categoryId ID of the post category
   * @param {string} text post text
   * @param {Express.Multer.File[]} files the files attached to the post
   */
  updatePost = (postId, title, categoryId, text, files) => {
    const { fileGroupId } = this.db
      .prepare('SELECT fileGroupId from forumPosts WHERE id = ?')
      .get(postId);
    this.fileHandler.saveFiles(files, fileGroupId);
    this.db
      .prepare('UPDATE forumPosts SET title = ?, categoryId = ?, text = ? WHERE id = ?')
      .run(title, categoryId, text, postId);
  };

  /**
   * Deletes the given post.
   * @param {number} postId ID of the post
   */
  deletePost = (postId) => {
    (
      this.db.prepare('SELECT id FROM forumReplies WHERE forumPostId = ?').all(postId) || []
    ).forEach(({ id }) => this.deleteReply(id));
    this.db.prepare('DELETE FROM forumPosts WHERE id = ?').run(postId);
  };

  /**
   * Returns the ID, name and colour for each category in the given course, as well as whether they
   * are selectable for students.
   * @param {number} courseId ID of the course
   * @returns categories for the given course
   */
  getCategories = (courseId) => {
    return (
      this.db
        .prepare(
          'SELECT id as categoryId, name as categoryName, ' +
            'color as categoryColor, selectableForStudents ' +
            'FROM forumCategories WHERE courseId = ?'
        )
        .all(courseId)
        .map((category) => ({
          ...category,
          selectableForStudents: category.selectableForStudents === 1,
        })) || []
    );
  };

  /**
   * Returns whether all given categories are part of the given course.
   * @param {number[]} categoryIds IDs of the categories
   * @param {number} courseId ID of the course
   * @returns {boolean}
   */
  areAllCategoriesInCourse = (categoryIds, courseId) => {
    if (categoryIds.length === 0) {
      return true;
    }
    return (
      this.db
        .prepare(
          'SELECT * FROM forumCategories c ' +
            `WHERE c.id IN (${Array(categoryIds.length).fill('?').join(', ')}) ` +
            `AND courseId = ?`
        )
        .all(...categoryIds, courseId)?.length === categoryIds.length
    );
  };

  /**
   * Updates the set of post categories for the given course.
   * @param {number} courseId ID of the course
   * @param {number[]} categories IDs of the new categories
   */
  updateCategories = (courseId, categories) => {
    // Delete categories that have been removed
    const existingCategories = categories
      .filter(({ categoryId }) => categoryId)
      .map((category) => ({
        ...category,
        selectableForStudents: category.selectableForStudents ? 1 : 0,
      }));

    const newCategories = categories
      .filter(({ categoryId }) => !categoryId)
      .map((category) => ({
        ...category,
        selectableForStudents: category.selectableForStudents ? 1 : 0,
      }));

    this.db
      .prepare(
        'DELETE FROM forumCategories ' +
          `WHERE courseId = ? ${
            existingCategories.length === 0
              ? ''
              : `AND id NOT IN (${Array(existingCategories.length).fill('?').join(', ')})`
          }`
      )
      .run(courseId, ...existingCategories.map(({ categoryId }) => categoryId));

    this.db
      .prepare(
        'UPDATE forumPosts SET categoryId = NULL ' +
          `WHERE courseId = ? ${
            existingCategories.length === 0
              ? ''
              : `AND categoryId NOT IN (${Array(existingCategories.length).fill('?').join(', ')})`
          }`
      )
      .run(courseId, ...existingCategories.map(({ categoryId }) => categoryId));

    // Update existing categories
    existingCategories.forEach((category) => {
      this.db
        .prepare(
          'UPDATE forumCategories SET name = ?, color = ?, selectableForStudents = ? WHERE id = ?'
        )
        .run(
          category.categoryName,
          category.categoryColor,
          category.selectableForStudents,
          category.categoryId
        );
    });

    if (newCategories.length > 0) {
      this.db
        .prepare(
          `INSERT INTO forumCategories(courseId, name, color, selectableForStudents) VALUES ${Array(
            newCategories.length
          )
            .fill('(?, ?, ?, ?)')
            .join(', ')}`
        )
        .run(
          ...newCategories
            .map((category) => [
              courseId,
              category.categoryName,
              category.categoryColor,
              category.selectableForStudents,
            ])
            .flat(2)
        );
    }
  };

  /**
   * Adds a reply to a post as the given user, with the text and attached files.
   * Also returns the ID of the newly added reply.
   * @param {number} userId ID of the user
   * @param {number} postId ID of the post
   * @param {string} text reply text
   * @param {Express.Multer.File[]} files the files attached to the reply
   * @returns {number} ID of the added reply
   */
  addReply = (userId, postId, text, files) => {
    return this.db
      .prepare(
        'INSERT INTO forumReplies(userId, forumPostId, text, fileGroupId, timeSent) VALUES (?, ?, ?, ?, ?) RETURNING id'
      )
      .get(userId, postId, text, this.fileHandler.saveFiles(files), Date.now()).id;
  };

  /**
   * Returns details of the given reply, namely:
   * - ID, first name and last name of the replier
   * - Reply text and time sent
   * - ID and name of each attached file
   * @param {number} replyId ID of the reply
   * @returns details of the reply
   */
  getReply = (replyId) => {
    const s = "JSON_GROUP_ARRAY(JSON_OBJECT('fileId', f.id, 'fileName', f.name)) AS files ";
    const reply = this.db
      .prepare('SELECT userId, text, timeSent, fileGroupId FROM forumReplies r WHERE r.id = ?')
      .get(replyId);
    const { firstName, lastName } = this.db
      .prepare('SELECT firstName, lastName FROM users WHERE id = ?')
      .get(reply.userId);
    reply.firstName = firstName;
    reply.lastName = lastName;
    reply.files = this.db
      .prepare('SELECT id AS fileId, name AS fileName FROM files WHERE fileGroupId = ?')
      .all(reply.fileGroupId);
    delete reply.fileGroupId;
    return reply;
  };

  /**
   * Updates the text and attached files for the given reply.
   * @param {number} replyId ID of the reply
   * @param {string} text reply text
   * @param {Express.Multer.File[]} files the files attached to the reply
   */
  updateReply = (replyId, text, files) => {
    const { fileGroupId } = this.db
      .prepare('SELECT fileGroupId FROM forumReplies r WHERE r.id = ?')
      .get(replyId);
    this.fileHandler.saveFiles(files, fileGroupId);
    this.db.prepare('UPDATE forumReplies SET text = ? WHERE id = ?').run(text, replyId);
  };

  /**
   * Deletes the given reply.
   * @param {number} replyId ID of the reply
   */
  deleteReply = (replyId) => {
    const { fileGroupId } = this.db
      .prepare('SELECT fileGroupId FROM forumReplies r WHERE r.id = ?')
      .get(replyId);
    this.fileHandler.deleteFiles(fileGroupId);
    this.db.prepare('DELETE FROM forumReplies WHERE id = ?').run(replyId);
  };

  /**
   * Returns the course containing the given reply.
   * @param {number} replyId ID of the reply
   * @returns {number} ID of the course
   */
  getCourseForReply = (replyId) => {
    return this.db
      .prepare(
        'SELECT courseId FROM forumReplies r JOIN forumPosts p ON r.forumPostId = p.id WHERE r.id = ?'
      )
      .get(replyId)?.courseId;
  };

  /**
   * Returns whether the given user created the given reply.
   * @param {number} userId ID of the user
   * @param {number} replyId ID of the reply
   * @returns {boolean}
   */
  isUserCreatorOfReply = (userId, replyId) => {
    return (
      this.db.prepare('SELECT userId FROM forumReplies WHERE id = ?').get(replyId)?.userId ===
      userId
    );
  };

  /**
   * Returns whether the given reply exists.
   * @param {number} replyId ID of the reply
   * @returns {boolean}
   */
  doesReplyExist = (replyId) => {
    return this.db.prepare('SELECT * FROM forumReplies WHERE id = ?').get(replyId) !== undefined;
  };
}

module.exports = ForumDBHandler;
