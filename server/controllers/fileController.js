const Database = require('better-sqlite3');
const path = require('path');
const mime = require('mime');

const { getFilePath, addFileToGroup } = require('../scripts/database');

const downloadFileHandler = async (req, res) => {
  const userId = req.userId;

  const filePath = getFilePath(parseInt(req.params.fileId));
  if (filePath) {
    const basename = path.basename(filePath);
    res.setHeader('Content-disposition', `attachment; filename=${basename}`);
    res.setHeader('Content-type', mime.lookup(basename));
    res.download(filePath, (err) => {
      console.error(err);
    });
  } else {
    res.status(404).send({
      message: 'File with ID ' + req.params.fileId + ' does not exist',
    });
  }
};

const getFileHandler = async (req, res) => {
  const filePath = getFilePath(parseInt(req.params.fileId));
  if (filePath) {
    res.sendFile(filePath);
  } else {
    res.status(404).send({
      message: 'File with ID ' + req.params.fileId + ' does not exist',
    });
  }
};

const addFileHandler = async (req, res) => {
  const userId = req.userId;

  res.send({ fileId: addFileToGroup(req.file.originalname, req.file.path, null) });
};

module.exports = {
  getFileHandler,
  downloadFileHandler,
  addFileHandler,
};
