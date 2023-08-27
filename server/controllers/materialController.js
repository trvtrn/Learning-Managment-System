const path = require('path');
const {
  doesMaterialExist,
  canUserEditMaterial,
  canUserViewMaterial,
  getTeachingMaterial,
  addTeachingMaterial,
  deleteTeachingMaterial,
  updateTeachingMaterial,
  getCourseOfMaterial,
  doesCourseExist,
  isUserEducatorOf,
  emailAllMembersInCourse,
  getCourse,
} = require('../scripts/database');

/**
 * Handler for GET /api/material/:materialId route
 */
const getMaterialHandler = async (req, res) => {
  const userId = req.userId;
  const materialId = req.params.materialId;

  if (!doesMaterialExist(materialId)) {
    res.status(404).send({ message: `teaching material with ID ${materialId} does not exist` });
  } else if (!canUserViewMaterial(userId, materialId)) {
    res.status(403).send({ message: 'unauthorised' });
  } else {
    res.send(getTeachingMaterial(materialId));
  }
};

/**
 * Handler for POST /api/material route
 */
const addMaterialHandler = async (req, res) => {
  const userId = req.userId;
  const courseId = req.body.courseId;
  const shouldNotifyStudents =
    req.body.shouldNotifyStudents === 'true' || req.body.shouldNotifyStudents === true;

  if (!doesCourseExist(courseId)) {
    res.status(404).send({ message: `course with ID ${courseId} does not exist` });
  } else if (!isUserEducatorOf(userId, courseId)) {
    res.status(403).send({ message: 'unauthorised' });
  } else {
    const materialId = addTeachingMaterial(
      courseId,
      req.body.materialName,
      req.body.description,
      req.files === undefined ? [] : req.files
    );

    if (shouldNotifyStudents) {
      emailAllMembersInCourse(
        courseId,
        `New Resource Available: ${req.body.materialName}`,
        {
          courseName: getCourse(courseId).courseName,
          link: `${process.env.HTTP_PROTOCOL}://${process.env.DOMAIN}:${process.env.CLIENT_PORT}/${courseId}/materials/${materialId}`,
          isUpdate: false,
        },
        path.resolve(__dirname, '../assets/materialNotification.handlebars')
      );
    }

    res.send({ materialId });
  }
};

/**
 * Handler for DELETE /api/material/:materialId route
 */
const deleteMaterialHandler = async (req, res) => {
  const userId = req.userId;
  const materialId = req.params.materialId;

  if (!doesMaterialExist(materialId)) {
    res.status(404).send({ message: `teaching material with ID ${materialId} does not exist` });
  } else if (!canUserEditMaterial(userId, materialId)) {
    res.status(403).send({ message: 'unauthorised' });
  } else {
    deleteTeachingMaterial(materialId);
    res.send({ message: `Successfully deleted teaching material with ID ${materialId}` });
  }
};

/**
 * Handler for PUT /api/material route
 */
const updateMaterialHandler = async (req, res) => {
  const userId = req.userId;
  const materialId = req.body.materialId;
  const shouldNotifyStudents =
    req.body.shouldNotifyStudents === 'true' || req.body.shouldNotifyStudents === true;

  if (!doesMaterialExist(materialId)) {
    res.status(404).send({ message: `teaching material with ID ${materialId} does not exist` });
  } else if (!canUserEditMaterial(userId, materialId)) {
    res.status(403).send({ message: 'unauthorised' });
  } else {
    if (shouldNotifyStudents) {
      const courseId = getCourseOfMaterial(materialId);
      emailAllMembersInCourse(
        courseId,
        `Resource Updated: ${req.body.materialName}`,
        {
          courseName: getCourse(courseId).courseName,
          link: `${process.env.HTTP_PROTOCOL}://${process.env.DOMAIN}:${process.env.CLIENT_PORT}/${courseId}/materials/${materialId}`,
          isUpdate: true,
        },
        path.resolve(__dirname, '../assets/materialNotification.handlebars')
      );
    }
    updateTeachingMaterial(
      materialId,
      req.body.materialName,
      req.body.description,
      req.files === undefined ? [] : req.files
    );
    res.send({ message: `Successfully updated teaching material with ID ${materialId}` });
  }
};

module.exports = {
  getMaterialHandler,
  addMaterialHandler,
  deleteMaterialHandler,
  updateMaterialHandler,
};
