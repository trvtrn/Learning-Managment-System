const express = require('express');
const { authenticate } = require('../utils/helpers');
const multer = require('multer');
const { STORAGE } = require('../utils/constants');
const controller = require('../controllers/fileController.js');
const router = express.Router();

/**
 * Downloads file with given fileId
 * Inputs:
 *  - fileId: string (must be castable to an integer)
 */
router.get('/download/:fileId', authenticate, controller.downloadFileHandler);

/**
 * Uploads a file
 * Outputs:
 *  - fileId: number
 */
router.post(
  '/',
  authenticate,
  multer({ storage: STORAGE }).single('file'),
  controller.addFileHandler
);

/**
 * Sends the file with given fileId
 * Inputs:
 *  - fileId: string (must be castable to an integer)
 */
router.get('/:fileId', controller.getFileHandler);

module.exports = router;
