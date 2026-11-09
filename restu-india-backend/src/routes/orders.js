const express = require('express');
const asyncHandler = require('express-async-handler');
const Order = require('../models/Order');
const { protect, admin } = require('../middleware/authMiddleware');

const router = express.Router();

// @route   GET /api/orders
// @desc    Get all orders (optionally filtered by status)
// @access  Private/Admin
router.get(
  '/',
  protect,
  admin,
  asyncHandler(async (req, res) => {
    const { status } = req.query;
    const query = {};

    if (status) query.status = status;

    const orders = await Order.find(query)
      .populate('user', 'name email')
      .sort({ createdAt: -1 });

    res.json({ orders });
  })
);

// @route   GET /api/orders/:id
// @desc    Get a single order
// @access  Private/Admin
router.get(
  '/:id',
  protect,
  admin,
  asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id).populate('user', 'name email');

    if (!order) {
      res.status(404);
      throw new Error('Order not found');
    }

    res.json(order);
  })
);

// @route   POST /api/orders
// @desc    Create a new order
// @access  Private
router.post(
  '/',
  protect,
  asyncHandler(async (req, res) => {
    const { items, shipping, totalPrice } = req.body;

    if (!items || !items.length) {
      res.status(400);
      throw new Error('Order must contain at least one item');
    }

    const order = await Order.create({
      user: req.user._id,
      items,
      shipping,
      totalPrice,
    });

    res.status(201).json(order);
  })
);

// @route   PATCH /api/orders/:id/status
// @desc    Update order status
// @access  Private/Admin
router.patch(
  '/:id/status',
  protect,
  admin,
  asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id);

    if (!order) {
      res.status(404);
      throw new Error('Order not found');
    }

    const { status } = req.body;
    const allowed = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

    if (!allowed.includes(status)) {
      res.status(400);
      throw new Error('Invalid status value');
    }

    order.status = status;
    const updated = await order.save();

    res.json(updated);
  })
);

module.exports = router;
