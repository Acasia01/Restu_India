const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
    },
    name: { type: String, required: true },
    emoji: { type: String, default: '✨' },
    size: { type: String, default: '' },
    price: { type: Number, required: true, min: 0 },
    qty: { type: Number, required: true, min: 1 },
  },
  { _id: false }
);

const shippingSchema = new mongoose.Schema(
  {
    fullName: { type: String, default: '' },
    line1: { type: String, default: '' },
    city: { type: String, default: '' },
    pincode: { type: String, default: '' },
    phone: { type: String, default: '' },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      required: true,
      unique: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    guestEmail: {
      type: String,
      default: '',
    },
    items: {
      type: [orderItemSchema],
      default: [],
    },
    shipping: {
      type: shippingSchema,
      default: () => ({}),
    },
    totalPrice: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    status: {
      type: String,
      enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
      default: 'pending',
    },
    isPaid: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

orderSchema.set('toJSON', { virtuals: true });
orderSchema.set('toObject', { virtuals: true });

// Generate a human friendly order number e.g. RI-1718233920123
orderSchema.pre('validate', function (next) {
  if (!this.orderNumber) {
    this.orderNumber = `RI-${Date.now()}`;
  }
  next();
});

module.exports = mongoose.model('Order', orderSchema);
