/**
 * Seed script
 * --------------------------------------------------
 * Populates the database with:
 *   - An admin user (from .env ADMIN_* values)
 *   - A set of product categories
 *   - A handful of sample products
 *
 * Usage:
 *   npm run seed
 */
require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./config/db');

const User = require('./models/User');
const Category = require('./models/Category');
const Product = require('./models/Product');

const CATEGORY_NAMES = [
  'Beds',
  'Trolleys',
  'Furniture',
  'Wheelchairs',
  'ICU Equipment',
  'Surgical Instruments',
];

const run = async () => {
  await connectDB();

  // ---- Admin user ----
  const adminEmail = process.env.ADMIN_EMAIL?.toLowerCase();
  const adminExists = await User.findOne({ email: adminEmail });

  if (!adminExists) {
    await User.create({
      name: process.env.ADMIN_NAME || 'Admin',
      email: adminEmail,
      password: process.env.ADMIN_PASSWORD || 'Admin@12345',
      role: 'admin',
    });
    console.log(`Created admin user: ${adminEmail}`);
  } else {
    console.log(`Admin user already exists: ${adminEmail}`);
  }

  // ---- Categories ----
  const categories = {};

  for (const name of CATEGORY_NAMES) {
    let category = await Category.findOne({ name });
    if (!category) {
      category = await Category.create({ name });
      console.log(`Created category: ${name}`);
    }
    categories[name] = category;
  }

  // ---- Sample products ----
  const sampleProducts = [
    {
      name: 'Manual ICU Bed (ABS Panel)',
      code: 'MSHFM-1001',
      category: categories['Beds']._id,
      price: 24999,
      comparePrice: 28999,
      emoji: '🛏️',
      description: 'Durable manual ICU bed with ABS panels, ideal for hospitals and home care.',
      isFeatured: true,
      isNew: true,
      variants: [{ size: 'Standard', stock: 12 }],
    },
    {
      name: 'Electric Fowler Bed (ABS Panel & Railing)',
      code: 'MSHFM-1003',
      category: categories['Beds']._id,
      price: 54999,
      emoji: '🛏️',
      description: 'Electric fowler bed with adjustable backrest, knee rest and side railings.',
      isFeatured: true,
      variants: [{ size: 'Standard', stock: 8 }],
    },
    {
      name: 'Stretcher Trolley',
      code: 'MSHFM-1031',
      category: categories['Trolleys']._id,
      price: 15999,
      emoji: '🛒',
      description: 'Heavy-duty stretcher trolley with smooth-rolling castor wheels.',
      variants: [{ size: 'Standard', stock: 20 }],
    },
    {
      name: 'Crash Cart (SS)',
      code: 'MSHFM-1023',
      category: categories['Trolleys']._id,
      price: 18999,
      emoji: '🧰',
      description: 'Stainless steel crash cart with multiple drawers for emergency supplies.',
      isNew: true,
      variants: [{ size: 'Standard', stock: 10 }],
    },
    {
      name: 'Deluxe Bed Side Locker',
      code: 'MSHFM-1040',
      category: categories['Furniture']._id,
      price: 6499,
      emoji: '🗄️',
      description: 'Sturdy bedside locker with storage compartments.',
      variants: [{ size: 'Standard', stock: 25 }],
    },
    {
      name: 'Folding Wheel Chair',
      code: 'MSHFM-1085',
      category: categories['Wheelchairs']._id,
      price: 4999,
      comparePrice: 6499,
      emoji: '♿',
      description: 'Lightweight, foldable wheelchair for easy transport and storage.',
      isFeatured: true,
      variants: [
        { size: 'Standard', stock: 15 },
        { size: 'Large', stock: 5 },
      ],
    },
  ];

  for (const data of sampleProducts) {
    const exists = await Product.findOne({ code: data.code });
    if (!exists) {
      await Product.create(data);
      console.log(`Created product: ${data.name}`);
    }
  }

  console.log('Seeding complete.');
  await mongoose.connection.close();
  process.exit(0);
};

run().catch((err) => {
  console.error('Seeding failed:', err);
  process.exit(1);
});
