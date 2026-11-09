const express = require('express');
const upload = require('../middleware/upload');
const { protect, admin } = require('../middleware/authMiddleware');

const router = express.Router();

// @route   POST /api/upload
// @desc    Upload one or more product images
// @access  Private/Admin
router.post('/', protect, admin, upload.array('images', 5), (req, res) => {
  if (!req.files || req.files.length === 0) {
    res.status(400);
    throw new Error('No files were uploaded');
  }

  const urls = req.files.map((file) => `/uploads/${file.filename}`);

  res.status(201).json({ urls });
});

module.exports = router;
