const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const filesController = require('../controllers/files.controller');
const { authenticate } = require('../middleware/auth.middleware');
const crypto = require('crypto');

// Configure multer with random filenames
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/temp/');
  },
  filename: (req, file, cb) => {
    const randomName = crypto.randomBytes(16).toString('hex');
    cb(null, randomName + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  }
});

router.use(authenticate);

router.post('/upload', upload.single('file'), filesController.upload);
router.get('/', filesController.list);
router.get('/:id/download', filesController.download);
router.delete('/:id', filesController.delete);

module.exports = router;
