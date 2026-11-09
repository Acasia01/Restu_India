const express = require('express');
const asyncHandler = require('express-async-handler');
const Product = require('../models/Product');
const { protect, admin } = require('../middleware/authMiddleware');

const router = express.Router();

// @route   GET /api/products
// @desc    Get products (supports pagination, search, category & featured filters)
// @access  Public
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const { search, category, featured, isNew, limit, page, includeInactive } = req.query;

    const query = {};

    if (!includeInactive) {
      query.isActive = true;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } },
        { code: { $regex: search, $options: 'i' } },
      ];
    }

    if (category) {
      query.category = category;
    }

    if (featured === 'true') {
      query.isFeatured = true;
    }

    if (isNew === 'true') {
      query.isNew = true;
    }

    const pageSize = limit ? Number(limit) : 100;
    const pageNumber = page ? Number(page) : 1;

    const total = await Product.countDocuments(query);

    const products = await Product.find(query)
      .populate('category', 'name slug')
      .sort({ createdAt: -1 })
      .limit(pageSize)
      .skip(pageSize * (pageNumber - 1));

    res.json({
      products,
      total,
      page: pageNumber,
      pages: Math.ceil(total / pageSize) || 1,
    });
  })
);

router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const { id } = req.params;

    // Try to find by Mongo _id first, then fall back to slug
    let product = null;

    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      product = await Product.findById(id).populate('category', 'name slug');
    }

    if (!product) {
      product = await Product.findOne({ slug: id }).populate('category', 'name slug');
    }

    if (!product) {
      res.status(404);
      throw new Error('Product not found');
    }

    res.json(product);
  })
);

const ALLOWED_FIELDS = [
  'name',
  'slug',
  'code',
  'description',
  'brand',
  'category',
  'price',
  'comparePrice',
  'emoji',
  'image',
  'images',
  'tags',
  'variants',
  'isFeatured',
  'isNew',
  'isActive',
];

const pickAllowedFields = (body) => {
  const data = {};
  for (const key of ALLOWED_FIELDS) {
    if (body[key] !== undefined) data[key] = body[key];
  }
  return data;
};

// @route   POST /api/products
// @desc    Create a new product
// @access  Private/Admin
router.post(
  '/',
  protect,
  admin,
  asyncHandler(async (req, res) => {
    const product = new Product(pickAllowedFields(req.body));
    const created = await product.save();
    const populated = await created.populate('category', 'name slug');

    res.status(201).json(populated);
  })
);

// @route   PATCH /api/products/:id
// @desc    Update a product
// @access  Private/Admin
router.patch(
  '/:id',
  protect,
  admin,
  asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id);

    if (!product) {
      res.status(404);
      throw new Error('Product not found');
    }

    Object.assign(product, pickAllowedFields(req.body));
    const updated = await product.save();
    const populated = await updated.populate('category', 'name slug');

    res.json(populated);
  })
);

router.delete(
  '/:id',
  protect,
  admin,
  asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id);

    if (!product) {
      res.status(404);
      throw new Error('Product not found');
    }

    await product.deleteOne();

    res.json({ message: 'Product deleted' });
  })
);

module.exports = router;
