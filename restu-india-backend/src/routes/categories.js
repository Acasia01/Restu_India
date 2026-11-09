const express = require('express');
const asyncHandler = require('express-async-handler');
const Category = require('../models/Category');
const { protect, admin } = require('../middleware/authMiddleware');

const router = express.Router();

// @route   GET /api/categories
// @desc    Get all categories
// @access  Public
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const categories = await Category.find().sort({ name: 1 });
    res.json(categories);
  })
);

// @route   GET /api/categories/:id
// @desc    Get a single category
// @access  Public
router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const category = await Category.findById(req.params.id);

    if (!category) {
      res.status(404);
      throw new Error('Category not found');
    }

    res.json(category);
  })
);

// @route   POST /api/categories
// @desc    Create a category
// @access  Private/Admin
router.post(
  '/',
  protect,
  admin,
  asyncHandler(async (req, res) => {
    const { name, description, image, slug } = req.body;

    if (!name) {
      res.status(400);
      throw new Error('Category name is required');
    }

    const exists = await Category.findOne({ name });
    if (exists) {
      res.status(400);
      throw new Error('Category already exists');
    }

    const category = await Category.create({ name, description, image, slug });
    res.status(201).json(category);
  })
);

// @route   PATCH /api/categories/:id
// @desc    Update a category
// @access  Private/Admin
router.patch(
  '/:id',
  protect,
  admin,
  asyncHandler(async (req, res) => {
    const category = await Category.findById(req.params.id);

    if (!category) {
      res.status(404);
      throw new Error('Category not found');
    }

    Object.assign(category, req.body);
    const updated = await category.save();

    res.json(updated);
  })
);

// @route   DELETE /api/categories/:id
// @desc    Delete a category
// @access  Private/Admin
router.delete(
  '/:id',
  protect,
  admin,
  asyncHandler(async (req, res) => {
    const category = await Category.findById(req.params.id);

    if (!category) {
      res.status(404);
      throw new Error('Category not found');
    }

    await category.deleteOne();
    res.json({ message: 'Category removed' });
  })
);

module.exports = router;
