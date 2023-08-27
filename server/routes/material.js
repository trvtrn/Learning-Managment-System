const express = require('express');
const { authenticate } = require('../utils/helpers');
const controller = require('../controllers/materialController');
const { STORAGE } = require('../utils/constants');
const multer = require('multer');

const router = express.Router();

/**
 * Each of the endpoints below return an error if:
 * - request is not authenticated
 * - user is not authorised to perform the operation
 * - course does not exist (where relevant)
 * - material does not exist (where relevant)
 */

/**
 * Returns details of the given material.
 * Inputs:
 * - materialId: string (must be castable to an integer)
 * Outputs:
 * - materialName: string
 * - description: string
 * - files: list of objects containing
 *   fileId: number
 *   fileName: string
 */
router.get('/:materialId', authenticate, controller.getMaterialHandler);

/**
 * Adds a material to the given course.
 * Inputs:
 * - courseId: number
 * - materialName: string
 * - description: string
 * - files: list of File objects
 * - shouldNotifyStudents: 'true' | 'false'
 * Outputs:
 * - materialId: number (ID of the newly created material)
 */
router.post(
  '/',
  authenticate,
  multer({ storage: STORAGE }).array('files'),
  controller.addMaterialHandler
);

/**
 * Deletes the given material.
 * Inputs:
 * - materialId: string (must be castable to an integer)
 */
router.delete('/:materialId', authenticate, controller.deleteMaterialHandler);

/**
 * Updates the given material with new details.
 * Inputs:
 * - materialId: number
 * - materialName: string
 * - description: string
 * - files: list of File objects
 * - shouldNotifyStudents: 'true' | 'false'
 */
router.put(
  '/',
  authenticate,
  multer({ storage: STORAGE }).array('files'),
  controller.updateMaterialHandler
);

module.exports = router;
