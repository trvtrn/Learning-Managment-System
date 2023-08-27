const { QUIZ_SUBMISSION_BUFFER, QUIZ_ANSWERS_RELEASE_BUFFER } = require('../constants');
const DBHandler = require('./handler');

class QuizDBHandler extends DBHandler {
  constructor(db, courseHandler) {
    super(db);
    this.courseHandler = courseHandler;
  }
  /**
   * Returns all quizzes in the given course in the database.
   * For each quiz, the quiz ID, name, release and due dates, duration, weighting, question conunt
   * and total marks are returned.
   * @param {number} courseId ID of the course
   * @returns {Quiz[]} the quizzes
   */
  getAllQuizzesForCourse = (courseId) => {
    return (
      this.db
        .prepare(
          'SELECT q.id as quizId, name, releaseDate, dueDate, duration, ' +
            'weighting, COUNT(qq.questionNumber) AS questionCount, ' +
            'SUM(qq.maximumMark) as totalMarks ' +
            'FROM quizzes q ' +
            'LEFT JOIN quizQuestions qq ON q.id = qq.quizId ' +
            'WHERE q.courseId = ? ' +
            'GROUP BY q.id'
        )
        .all(courseId) || []
    );
  };

  /**
   * Returns the name, description, release & due date, duration, total marks and weighting for the given quiz.
   * @param {number} quizId ID of the quiz
   * @returns {Object} quiz details
   */
  getQuizDetails = (quizId) => {
    const details = this.db
      .prepare(
        'SELECT name, description, releaseDate, dueDate, duration, weighting, releaseMarks ' +
          'FROM quizzes q ' +
          'LEFT JOIN quizQuestions qq ON qq.quizId = q.id ' +
          'WHERE q.id = ? ' +
          'GROUP BY q.id'
      )
      .get(quizId);
    details.releaseMarks = details.releaseMarks == 1;
    return details;
  };

  /**
   * Adds a quiz with the given details to the given course in the database.
   * Returns the ID of the newly added quiz.
   * @param {number} courseId ID of the course
   * @param {string} name quiz name
   * @param {string} description quiz description
   * @param {string} releaseDate quiz release date
   * @param {string} dueDate quiz due date
   * @param {number} duration quiz duration in minutes
   * @param {number} weighting quiz weighting as a percentage
   * @param {Question[]} questions array of questions to add
   * @returns {number} ID of newly created quiz
   */
  addQuizToCourse = (
    courseId,
    name,
    description,
    releaseDate,
    dueDate,
    duration,
    weighting,
    questions
  ) => {
    const quizId = this.db
      .prepare(
        'INSERT INTO quizzes (courseId, name, description, releaseDate, dueDate, duration, weighting, releaseMarks) ' +
          'VALUES (?, ?, ?, ?, ?, ?, ?, 0) RETURNING id'
      )
      .get(courseId, name, description, releaseDate, dueDate, duration, weighting).id;

    questions.forEach((question, questionNumber) => {
      this.addQuizQuestion(
        quizId,
        questionNumber,
        question.questionType,
        question.questionText,
        question.maximumMark,
        question.options
      );
    });

    return quizId;
  };

  /**
   * Updates the given quiz with the given details and questions.
   * All previously associated submissions and questions are deleted.
   * @param {number} quizId ID of the quiz
   * @param {string} name the quiz name
   * @param {string} description the quiz description
   * @param {number} releaseDate the release date in milliseconds since epoch
   * @param {due date} dueDate the due date in milliseconds since epoch
   * @param {number} duration the quiz duration
   * @param {number} weighting the quiz weighting as a percentage between 0 and 100
   * @param {Question[]} questions array of questions to set
   */
  updateQuizDetails = (
    quizId,
    name,
    description,
    releaseDate,
    dueDate,
    duration,
    weighting,
    questions
  ) => {
    // Remove all related submissions and questions
    this.db.prepare('DELETE FROM quizSubmissions WHERE quizId = ?').run(quizId);
    this.db.prepare('DELETE FROM quizQuestions WHERE quizId = ?').run(quizId);
    this.db.prepare('DELETE FROM quizOptions WHERE quizId = ?').run(quizId);
    this.db.prepare('DELETE FROM quizResponses WHERE quizId = ?').run(quizId);

    // Update general quiz details
    this.db
      .prepare(
        'UPDATE quizzes SET name = ?, description = ?, releaseDate = ?, dueDate = ?, duration = ?, weighting = ? WHERE id = ?'
      )
      .run(name, description, releaseDate, dueDate, duration, weighting, quizId);

    // Add updated questions
    questions.forEach((question, questionNumber) => {
      this.addQuizQuestion(
        quizId,
        questionNumber,
        question.questionType,
        question.questionText,
        question.maximumMark,
        question.options
      );
    });
  };

  /**
   * Removes the given quiz.
   * @param {number} quizId ID of the quiz
   */
  removeQuiz = (quizId) => {
    this.db.prepare('DELETE FROM quizzes WHERE id = ?').run(quizId);
  };

  /**
   * Returns all questions in the given quiz, as well as extra details based on given flags.
   * @param {number} quizId ID of the quiz
   * @param {boolean} shouldIncludeQuestionDetails get question details if true
   * @param {boolean} shouldIncludeAnswer get multiple choice answers if true
   * @returns {{questionId: number,
   *  questionText: string,
   *  questionNumber: number,
   *  questionType: string,
   *  maximumMark: number,
   *  options: {optionText: string, optionNumber: number, isAnswer?: boolean}[]}[]}
   */
  getAllQuestionsInQuiz = (quizId, shouldIncludeQuestionDetails, shouldIncludeAnswer) => {
    const questions =
      this.db
        .prepare(
          'SELECT ' +
            'qq.questionText AS questionText, ' +
            'qq.questionNumber AS questionNumber, ' +
            'qq.questionType AS questionType, ' +
            'qq.maximumMark AS maximumMark, ' +
            "JSON_GROUP_ARRAY(JSON_OBJECT('optionNumber', optionNumber, 'optionText', optionText, 'isAnswer', isAnswer)) as options " +
            'FROM quizQuestions qq ' +
            'LEFT JOIN quizOptions qo ON qo.questionNumber = qq.questionNumber AND qo.quizId = qq.quizId ' +
            'WHERE qq.quizId = ? GROUP BY qq.questionNumber'
        )
        .all(quizId) || [];

    for (const question of questions) {
      if (!shouldIncludeQuestionDetails) {
        delete question.questionText;
        delete question.questionType;
        delete question.options;
        continue;
      }
      question.options = JSON.parse(question.options);
      // This question has no options
      if (question.options.length === 1 && question.options[0].optionNumber === null) {
        question.options = [];
        continue;
      }

      // Convert isAnswer to boolean
      for (const option of question.options) {
        if (!shouldIncludeAnswer) {
          delete option.isAnswer;
        } else {
          option.isAnswer = option.isAnswer === 1;
        }
      }
    }
    return questions;
  };

  /**
   * Returns whether the user has started the given quiz.
   * @param {number} userId ID of the user
   * @param {number} quizId ID of the quiz
   * @returns {boolean}
   */
  hasUserStartedQuiz = (userId, quizId) => {
    return (
      this.db
        .prepare('SELECT * FROM quizSubmissions WHERE quizId = ? AND userId = ?')
        .get(quizId, userId) !== undefined
    );
  };

  /**
   * Returns whether the given quiz has finished for the user, that is:
   * - the due date of the quiz has passed, or
   * - the timer for the user has expired.
   * @param {number} quizId ID of the quiz
   * @returns {boolean}
   */
  hasQuizFinishedForUser = (quizId, userId) => {
    const now = Date.now();
    const { dueDate, duration } = this.db
      .prepare('SELECT dueDate, duration FROM quizzes WHERE id = ?')
      .get(quizId);
    const queryResult = this.db
      .prepare('SELECT startTime FROM quizSubmissions WHERE quizId = ? AND userId = ?')
      .get(quizId, userId);

    if (queryResult === undefined) {
      return false;
    }

    return (
      now >= dueDate + QUIZ_SUBMISSION_BUFFER ||
      now >= queryResult.startTime + 60 * 1000 * duration + QUIZ_SUBMISSION_BUFFER
    );
  };

  /**
   * Adds a question with the given details to the given quiz in the database.
   * The options parameter is ignored if the question type is not multiple choice.
   * @param {number} quizId ID of the quiz
   * @param {string} type type of question
   * @param {string} text the question text
   * @param {number} maximumMark marks for the question
   * @param {{string, boolean}[]} options multiple choice options for the question
   */
  addQuizQuestion = (quizId, questionNumber, type, text, maximumMark, options) => {
    this.db
      .prepare(
        'INSERT INTO quizQuestions (quizId, questionNumber, questionType, questionText, maximumMark) VALUES (?, ?, ?, ?, ?)'
      )
      .run(quizId, questionNumber, type, text, maximumMark).id;

    if (type === 'Multiple Choice') {
      options.forEach((option, optionNumber) => {
        this.db
          .prepare(
            'INSERT INTO quizOptions (quizId, optionNumber, questionNumber, optionText, isAnswer) VALUES (?, ?, ?, ?, ?)'
          )
          .run(quizId, optionNumber, questionNumber, option.optionText, option.isAnswer ? 1 : 0);
      });
    }
  };

  /**
   * Gets all submissions to the given quiz with the submitter ID, submitter names, email, mark, and
   * marker ID and names.
   * @param {number} quizId ID of the quiz
   * @returns {Submission[]} the submissions
   */
  getAllSubmissionsForQuiz = (quizId) => {
    return (
      this.db
        .prepare(
          'SELECT qs.userId, u1.firstName AS firstName, u1.lastName AS lastName, u1.email AS email, ' +
            'qs.markedById AS markerId, u2.firstName AS markerFirstName, u2.lastName AS markerLastName ' +
            'FROM quizSubmissions qs ' +
            'JOIN quizzes q ON q.id = qs.quizId ' +
            'JOIN users u1 ON userId = u1.id ' +
            'LEFT JOIN users u2 ON markerId = u2.id ' +
            'WHERE q.id = ? AND (qs.startTime + q.duration * 60 * 1000 + ? < ? OR q.dueDate + ? < ?)'
        )
        .all(quizId, QUIZ_SUBMISSION_BUFFER, Date.now(), QUIZ_SUBMISSION_BUFFER, Date.now())
        ?.map((result) => ({
          ...result,
          mark: this.getTotalQuizMarks(quizId, result.userId),
        })) || []
    );
  };

  /**
   * Gets all answers provided by the user for the given quiz, with question number, answer text,
   * and the option number.
   * @param {number} quizId ID of the user
   * @param {number} userId ID of the quiz
   * @returns {Answer[]} the answers
   */
  getQuizSubmissionAnswers = (quizId, userId) => {
    return {
      startTime: this.db
        .prepare('SELECT startTime FROM quizSubmissions WHERE quizId = ? AND userId = ?')
        .get(quizId, userId).startTime,
      answers:
        this.db
          .prepare(
            'SELECT questionNumber, answer AS answerText, optionNumber FROM quizResponses WHERE quizId = ? AND userId = ?'
          )
          .all(quizId, userId) || [],
    };
  };

  /**
   * Starts a new, empty submission for the user to the given quiz.
   * Also returns the start time of the new submission.
   * Marks awarded for all questions are initially 0.
   * @param {number} userId ID of the user
   * @param {number} quizId ID of the quiz
   * @returns {number} start time of the quiz (milliseconds since epoch)
   */
  startQuizSubmission = (userId, quizId) => {
    const startTime = Date.now();
    this.db
      .prepare('INSERT INTO quizSubmissions (quizId, userId, startTime) VALUES (?, ?, ?)')
      .run(quizId, userId, startTime);

    // Add blank submissions to all questions
    this.db
      .prepare('SELECT questionNumber FROM quizQuestions WHERE quizId = ?')
      .all(quizId)
      .forEach(({ questionNumber }) => {
        this.db
          .prepare(
            'INSERT INTO quizResponses (quizId, userId, questionNumber, mark) VALUES (?, ?, ?, 0)'
          )
          .run(quizId, userId, questionNumber);
      });

    return startTime;
  };

  /**
   * As the given user, makes a submission to questions in the given quiz.
   * Assumes that the user has already started the quiz.
   * Multiple choice questions are automatically marked.
   * @param {number} userId ID of the user
   * @param {number} quizId ID of the quiz
   * @param {Answer[]} answers the submitted answers as {questionNumber, answerText, optionNumber}
   */
  makeQuizSubmission = (userId, quizId, answers) => {
    // clear all previous responses and marks
    this.db
      .prepare(
        'UPDATE quizResponses SET answer = NULL, optionNumber = NULL, mark = 0 WHERE quizId = ? AND userId = ?'
      )
      .run(quizId, userId);

    answers.forEach(({ answerText, optionNumber, questionNumber }) => {
      const { questionType } = this.db
        .prepare('SELECT questionType FROM quizQuestions WHERE quizId = ? AND questionNumber = ?')
        .get(quizId, questionNumber);
      if (questionType === 'Short Answer') {
        this.db
          .prepare(
            'UPDATE quizResponses SET answer = ? WHERE quizId = ? AND userId = ? AND questionNumber = ?'
          )
          .run(answerText, quizId, userId, questionNumber);
      } else {
        const mark = this.calculateQuestionMark(quizId, questionNumber, optionNumber);
        this.db
          .prepare(
            'UPDATE quizResponses SET optionNumber = ?, mark = ? WHERE quizId = ? AND userId = ? AND questionNumber = ?'
          )
          .run(optionNumber, mark, quizId, userId, questionNumber);
      }
    });
  };

  /**
   * Gets the marks awarded to the given user for each short answer question in the given quiz.
   * @param {number} quizId ID of the quiz
   * @param {number} userId ID of the user
   * @returns {QuestionMark[]} marks for each question as {questionNumber, mark}
   */
  getMarksForQuizSubmission = (quizId, userId) => {
    return this.db
      .prepare('SELECT questionNumber, mark FROM quizResponses WHERE quizId = ? AND userId = ?')
      .all(quizId, userId)
      .filter(
        ({ questionNumber }) => this.getQuestionType(quizId, questionNumber) === 'Short Answer'
      );
  };

  /**
   * As the given marker, assigns a mark to the given questions in the given quiz for the given
   * submitter. Assumes that all given questions are short answer questions.
   * @param {number} markerId ID of the marker
   * @param {number} quizId ID of the quiz
   * @param {number} submitterId ID of the submitter
   * @param {QuestionMark[]} questionMarks marks for each question as {questionNumber, mark}
   */
  markQuizSubmission = (markerId, quizId, submitterId, questionMarks) => {
    questionMarks.forEach(({ questionNumber, mark }) => {
      this.db
        .prepare(
          'UPDATE quizResponses SET mark = ? WHERE quizId = ? AND userId = ? AND questionNumber = ?'
        )
        .run(mark, quizId, submitterId, questionNumber);
    });

    // set marker of quiz submission
    this.db
      .prepare('UPDATE quizSubmissions SET markedById = ? WHERE quizId = ? AND userId = ?')
      .run(markerId, quizId, submitterId);
  };

  /**
   * Sets whether marks for the given quiz are released.
   * @param {number} quizId ID of the quiz
   * @param {boolean} releaseMarks marks released status
   */
  setMarksReleased = (quizId, releaseMarks) => {
    this.db
      .prepare('UPDATE quizzes SET releaseMarks = ? WHERE id = ?')
      .run(releaseMarks ? 1 : 0, quizId);
  };

  /**
   * Returns whether marks have been released for the given quiz.
   * @param {number} quizId ID of the quiz
   * @returns {boolean}
   */
  areQuizMarksReleased = (quizId) => {
    return (
      this.db.prepare('SELECT releaseMarks FROM quizzes WHERE id = ?').get(quizId).releaseMarks == 1
    );
  };

  /**
   * Returns whether a quiz with the given ID exists in the database.
   * @param {number} quizId ID of the quiz
   * @returns {boolean}
   */
  doesQuizExist = (quizId) => {
    return this.db.prepare('SELECT * FROM quizzes WHERE id = ?').get(quizId) !== undefined;
  };

  /**
   * Returns the course containing the given quiz in the database.
   * @param {number} quizId ID of the quiz
   * @returns {number} ID of the course containing the quiz
   */
  getCourseContainingQuiz = (quizId) => {
    return this.db.prepare('SELECT courseId FROM quizzes WHERE id = ?').get(quizId).courseId;
  };

  /**
   * Returns whether the user can make a submission to the given quiz in the database.
   * @param {number} userId ID of the user
   * @param {number} quizId ID of the quiz
   * @returns {boolean}
   */
  canUserStartQuiz = (userId, quizId) => {
    return (
      this.courseHandler.isUserEnrolledIn(userId, this.getCourseContainingQuiz(quizId)) &&
      this.isQuizActive(quizId) &&
      !this.hasUserStartedQuiz(userId, quizId)
    );
  };

  /**
   * Returns whether the user can make a submission to the given quiz.
   * @param {number} userId ID of the user
   * @param {number} quizId ID of the quiz
   * @returns {boolean}
   */
  canUserSubmitQuiz = (userId, quizId) => {
    return this.hasUserStartedQuiz(userId, quizId) && !this.hasQuizFinishedForUser(quizId, userId);
  };

  /**
   * Returns whether the given quiz is active, i.e. released but not past its due date.
   * @param {number} quizId ID of the quiz
   * @returns {boolean}
   */
  isQuizActive = (quizId) => {
    const { releaseDate, dueDate } = this.db
      .prepare('SELECT releaseDate, dueDate FROM quizzes WHERE id = ?')
      .get(quizId);

    const now = Date.now();
    return releaseDate <= now && now <= dueDate;
  };

  /**
   * Returns whether the user is able to view their marks for the given quiz.
   * @param {number} userId ID of the user
   * @param {number} quizId ID of the quiz
   * @returns {boolean}
   */
  canUserAccessMarks = (userId, quizId) => {
    return this.areQuizMarksReleased(quizId) && this.hasQuizFinishedForUser(quizId, userId);
  };

  /**
   * Returns whether the user can access answers to the given quiz. That is:
   * - marks have been released for the quiz, AND
   * - it is either 1 second before the quiz due date, or the user's quiz duration has expired.
   * @param {number} userId ID of the user
   * @param {ID} quizId ID of the quiz
   * @returns {boolean}
   */
  canUserAccessQuizAnswers = (userId, quizId) => {
    const now = Date.now();
    const { dueDate, duration } = this.db
      .prepare('SELECT dueDate, duration FROM quizzes WHERE id = ?')
      .get(quizId);
    const queryResult = this.db
      .prepare('SELECT startTime FROM quizSubmissions WHERE quizId = ? AND userId = ?')
      .get(quizId, userId);

    if (queryResult === undefined) {
      return false;
    }

    return (
      this.areQuizMarksReleased(quizId) &&
      (now >= dueDate - QUIZ_ANSWERS_RELEASE_BUFFER ||
        now >= queryResult.startTime + 60 * 1000 * duration - QUIZ_ANSWERS_RELEASE_BUFFER)
    );
  };

  /**
   * Returns whether the given user is able to assign marks to the given submission.
   * @param {number} userId ID of the user making the request
   * @param {number} submissionId ID of the submission
   * @returns {boolean}
   */
  canUserMarkSubmission = (markerId, quizId, submitterId) => {
    return (
      this.courseHandler.isUserEducatorOf(markerId, this.getCourseContainingQuiz(quizId)) &&
      this.hasQuizFinishedForUser(quizId, submitterId)
    );
  };

  /**
   * Returns the mark that would be awarded to the given multiple choice question of the given quiz
   * if the selected option is the one given.
   * @param {number} quizId ID of the quiz
   * @param {number} questionNumber the question number
   * @param {number} optionNumber the selected option number
   * @returns {number} marks awarded
   */
  calculateQuestionMark = (quizId, questionNumber, optionNumber) => {
    const { maximumMark } = this.db
      .prepare('SELECT maximumMark FROM quizQuestions WHERE quizId = ? AND questionNumber = ?')
      .get(quizId, questionNumber);
    return this.isOptionCorrect(quizId, questionNumber, optionNumber) ? maximumMark : 0;
  };

  /**
   * Returns the type of the given question in the given quiz.
   * @param {number} quizId ID of the quiz
   * @param {number} questionNumber the question number
   * @returns {string} 'Short Answer' or 'Multiple Choice'
   */
  getQuestionType = (quizId, questionNumber) => {
    return this.db
      .prepare('SELECT questionType from quizQuestions WHERE quizId = ? AND questionNumber = ?')
      .get(quizId, questionNumber).questionType;
  };

  /**
   * Returns whether the given option number is correct for the given question in the quiz.
   * Assumes that the given question is a multiple choice question.
   * @param {number} quizId ID of the quiz
   * @param {number} questionNumber the question number
   * @param {number} optionNumber the option number
   * @returns {boolean}
   */
  isOptionCorrect = (quizId, questionNumber, optionNumber) => {
    return (
      this.db
        .prepare(
          'SELECT isAnswer FROM quizOptions WHERE quizId = ? AND questionNumber = ? AND optionNumber = ?'
        )
        .get(quizId, questionNumber, optionNumber)?.isAnswer === 1
    );
  };

  /**
   * Returns the total marks for the given quiz for the given user.
   * Assumes that the submission has been marked.
   * @param {number} quizId ID of the quiz
   * @param {number} userId ID of the user
   * @returns {number} the total marks
   */
  getTotalQuizMarks = (quizId, userId) => {
    return this.db
      .prepare('SELECT mark FROM quizResponses WHERE quizId = ? AND userId = ?')
      .all(quizId, userId)
      .reduce((total, { mark }) => total + mark, 0);
  };
}

module.exports = QuizDBHandler;
