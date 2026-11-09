const express = require('express');
const asyncHandler = require('express-async-handler');
const Enquiry = require('../models/Enquiry');
const { protect, admin } = require('../middleware/authMiddleware');

const router = express.Router();

// @route   POST /api/enquiries
// @desc    Submit a new enquiry (contact form)
// @access  Public
router.post(
  '/',
  asyncHandler(async (req, res) => {
    const { name, email, phone, company, category, purpose, message } = req.body;

    if (!name || !message) {
      res.status(400);
      throw new Error('Name and message are required');
    }

    const enquiry = await Enquiry.create({
      name,
      email,
      phone,
      company,
      category: category || undefined,
      purpose,
      message,
    });

    res.status(201).json(enquiry);
  })
);

// @route   GET /api/enquiries
// @desc    Get all enquiries
// @access  Private/Admin
router.get(
  '/',
  protect,
  admin,
  asyncHandler(async (req, res) => {
    const enquiries = await Enquiry.find()
      .populate('category', 'name')
      .sort({ createdAt: -1 });

    res.json({ enquiries });
  })
);

// @route   PATCH /api/enquiries/:id
// @desc    Update enquiry status
// @access  Private/Admin
router.patch(
  '/:id',
  protect,
  admin,
  asyncHandler(async (req, res) => {
    const enquiry = await Enquiry.findById(req.params.id);

    if (!enquiry) {
      res.status(404);
      throw new Error('Enquiry not found');
    }

    if (req.body.status) enquiry.status = req.body.status;
    const updated = await enquiry.save();

    res.json(updated);
  })
);

// @route   DELETE /api/enquiries/:id
// @desc    Delete an enquiry
// @access  Private/Admin
router.delete(
  '/:id',
  protect,
  admin,
  asyncHandler(async (req, res) => {
    const enquiry = await Enquiry.findById(req.params.id);

    if (!enquiry) {
      res.status(404);
      throw new Error('Enquiry not found');
    }

    await enquiry.deleteOne();
    res.json({ message: 'Enquiry removed' });
  })
);

module.exports = router;
