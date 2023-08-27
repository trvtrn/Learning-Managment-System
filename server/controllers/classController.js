const {
  getCourseForClass,
  doesClassExist,
  isUserEnrolledIn,
  isUserEducatorOf,
  getClassName,
  getMessagesFromClass,
  addClass,
  getClass,
  updateClass,
  deleteClass,
  isClassInSession,
} = require('../scripts/database');

/**
 * Handler for GET /api/class/:classId route
 */
const getClassHandler = (req, res) => {
  // Check if user is authenticated
  const userId = req.userId;

  // Check if class exists
  const classId = parseInt(req.params.classId);
  if (!doesClassExist(classId)) {
    return res.status(404).send({ message: `Class with id ${classId} not found` });
  }

  // Check if user is authorised to access this class
  const courseId = getCourseForClass(classId);
  if (!isUserEnrolledIn(userId, courseId)) {
    return res.status(403).send({ message: 'You do not have permission to access this class' });
  }

  if (!isClassInSession(classId)) {
    return res.status(403).send({ message: `Class with id ${classId} is not in progress` });
  }

  // Return all messages
  res.json({
    className: getClassName(classId),
    messages: getMessagesFromClass(classId),
  });
};

/**
 * Handler for POST /api/class route
 */
const addClassHandler = (req, res) => {
  // Check if user is authenticated
  const userId = req.userId;

  // Check if user is authorised to add a class
  const courseId = parseInt(req.body.courseId);
  if (!isUserEducatorOf(userId, courseId)) {
    return res.status(403).send({ message: 'You do not have permissions to create a class' });
  }

  const classId = addClass(
    req.body.courseId,
    req.body.className,
    req.body.startTime,
    req.body.endTime,
    req.body.frequency
  );
  res.send({ classId });
};

/**
 * Handler for PUT /api/class route
 */
const updateClassHandler = (req, res) => {
  // Check if user is authenticated
  const userId = req.userId;

  // Check if class exists
  const classId = parseInt(req.body.classId);
  if (!doesClassExist(parseInt(classId))) {
    return res.status(404).send({ message: `Class with id ${req.body.classId} not found` });
  }

  // Check if user is authorised to update the class
  const courseId = getCourseForClass(classId);
  if (!isUserEducatorOf(userId, courseId)) {
    return res.status(403).send({ message: 'You do not have permission to edit this class' });
  }

  updateClass(
    classId,
    req.body.className,
    req.body.startTime,
    req.body.endTime,
    req.body.frequency
  );
  res.send({ message: 'Successfully updated class' });
};

/**
 * Handler for DELETE /api/class/:classId route
 */
const deleteClassHandler = (req, res) => {
  // Check if user is authenticated
  const userId = req.userId;

  // Check if class exists
  const classId = parseInt(req.params.classId);
  if (!doesClassExist(classId)) {
    return res.status(404).send({ message: `Class with id ${classId} not found` });
  }

  // Check if user is authorised to delete this class
  const courseId = getCourseForClass(classId);
  if (!isUserEducatorOf(userId, courseId)) {
    return res.status(403).send({ message: `You do not have permission to delete this class` });
  }

  // Remove online class
  deleteClass(classId);
  res.send({ message: `Class with id ${classId} deleted` });
};

module.exports = {
  getClassHandler,
  addClassHandler,
  updateClassHandler,
  deleteClassHandler,
};
