const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const multer = require('multer');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// Serve static uploads
const uploadsDir = path.join(__dirname, 'src', 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
app.use('/uploads', express.static(uploadsDir));
app.use('/api/uploads', express.static(uploadsDir));

// Configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const filename = 'img_' + Date.now() + '_' + Math.round(Math.random() * 1e9) + ext;
    cb(null, filename);
  }
});
const upload = multer({ storage });

const dbFile = path.join(__dirname, 'mock_db.json');

// ── Initialize DB ─────────────────────────────────────────────────────────
if (!fs.existsSync(dbFile)) {
  const initialData = {
    users: [
      { _id: "admin_user_id", name: "System Admin", email: "admin@restuindia.in", password: "adminpassword", role: "admin", createdAt: new Date().toISOString() }
    ],
    categories: [
      { _id: "cat_beds",        name: "Beds",          slug: "beds",          description: "Premium hospital and fowler beds.", image: "https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=400&q=80" },
      { _id: "cat_trolleys",    name: "Trolleys",      slug: "trolleys",      description: "Stretcher and crash cart trolleys.", image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=400&q=80" },
      { _id: "cat_furniture",   name: "Furniture",     slug: "furniture",     description: "Ward lockers and bedside tables.", image: "https://images.unsplash.com/photo-1586773860383-dab5f3bc1b54?auto=format&fit=crop&w=400&q=80" },
      { _id: "cat_wheelchairs", name: "Wheelchairs",   slug: "wheelchairs",   description: "Manual and motorized wheelchairs.", image: "https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?auto=format&fit=crop&w=400&q=80" },
      { _id: "cat_icu",         name: "ICU Equipment", slug: "icu-equipment", description: "Patient monitors and ICU ventilators.", image: "https://images.unsplash.com/photo-1584515901367-f134706ef532?auto=format&fit=crop&w=400&q=80" }
    ],
    products: [
      { _id: "prod_1", name: "Manual ICU Bed (ABS Panel)", code: "MSHFM-1001", category: { _id: "cat_beds", name: "Beds", slug: "beds" }, price: 24999, comparePrice: 28999, emoji: "🛏️", description: "Durable manual ICU bed with ABS panels.", isFeatured: true, isNew: true, isActive: true, images: ["https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=600&q=80"], tags: ["icu","bed"], variants: [{ size: "Standard", stock: 12 }], createdAt: new Date(Date.now()-7*86400000).toISOString() },
      { _id: "prod_2", name: "Electric Fowler Bed (ABS Panel & Railing)", code: "MSHFM-1003", category: { _id: "cat_beds", name: "Beds", slug: "beds" }, price: 54999, emoji: "🛏️", description: "Electric fowler bed with adjustable backrest.", isFeatured: true, isNew: false, isActive: true, images: ["https://images.unsplash.com/photo-1586773860418-d37222d8fce2?auto=format&fit=crop&w=600&q=80"], tags: ["fowler","bed","electric"], variants: [{ size: "Standard", stock: 8 }], createdAt: new Date(Date.now()-5*86400000).toISOString() },
      { _id: "prod_3", name: "Stretcher Trolley", code: "MSHFM-1031", category: { _id: "cat_trolleys", name: "Trolleys", slug: "trolleys" }, price: 15999, emoji: "🛒", description: "Heavy-duty stretcher trolley.", isFeatured: false, isNew: false, isActive: true, images: ["https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=600&q=80"], tags: ["stretcher","trolley"], variants: [{ size: "Standard", stock: 20 }], createdAt: new Date(Date.now()-3*86400000).toISOString() }
    ],
    enquiries: [
      { _id: "enq_1", name: "Dr. Rajesh Sharma", email: "rajesh@maxhealthcare.com", phone: "9876543210", company: "Max Healthcare", purpose: "Hospital Setup", message: "Need a quote for 15 Electric Fowler Beds and 5 Stretcher Trolleys.", status: "new", createdAt: new Date(Date.now()-2*86400000).toISOString() }
    ],
    orders: [
      { _id: "ord_1", orderNumber: "RI-1718233920123", user: { _id: "admin_user_id", name: "System Admin", email: "admin@restuindia.in" }, items: [{ product: "prod_1", name: "Manual ICU Bed (ABS Panel)", price: 24999, qty: 2, emoji: "🛏️", size: "Standard" }], shipping: { fullName: "Dr. Rajesh", line1: "Saket Institutional Area", city: "New Delhi", pincode: "110017", phone: "9876543210" }, totalPrice: 49998, status: "pending", isPaid: false, createdAt: new Date(Date.now()-86400000).toISOString() }
    ],
    coupons: [
      { _id: "coupon_1", code: "WELCOME20", type: "percent", value: 20, minOrder: 500, uses: 34, maxUses: 100, active: true, expiry: "2026-12-31", createdAt: new Date().toISOString() },
      { _id: "coupon_2", code: "FLAT100", type: "flat", value: 100, minOrder: 1000, uses: 12, maxUses: 50, active: true, expiry: "2026-09-30", createdAt: new Date().toISOString() },
      { _id: "coupon_3", code: "SUMMER15", type: "percent", value: 15, minOrder: 300, uses: 50, maxUses: 50, active: false, expiry: "2026-06-30", createdAt: new Date().toISOString() }
    ],
    settings: {
      storeName: "Restu India",
      storeEmail: "info@restuindia.com",
      storePhone: "+91 92171 96621",
      storeWebsite: "https://restuindia.com",
      storeAddress: "Delhi, India",
      currency: "INR",
      timezone: "Asia/Kolkata",
      notifications: {
        emailOrders: true, emailEnquiries: true, emailNewUsers: false,
        smsOrders: false, smsLowStock: true
      }
    }
  };
  fs.writeFileSync(dbFile, JSON.stringify(initialData, null, 2));
}

function readDB() { return JSON.parse(fs.readFileSync(dbFile, 'utf8')); }
function writeDB(data) { fs.writeFileSync(dbFile, JSON.stringify(data, null, 2)); }

// ── Middleware ────────────────────────────────────────────────────────────
const protect = (req, res, next) => {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) return res.status(401).json({ message: 'Not authorized' });
  req.user = { _id: 'admin_user_id', name: 'System Admin', email: 'admin@restuindia.in', role: 'admin' };
  next();
};
const admin = (req, res, next) => {
  if (req.user?.role === 'admin') return next();
  res.status(403).json({ message: 'Admin access required' });
};

// ═══════════════════════════════════════════════════════════════════════════
//  ROOT
// ═══════════════════════════════════════════════════════════════════════════
app.get('/api/', (req, res) => res.json({ message: 'Restu India API is running' }));

// ═══════════════════════════════════════════════════════════════════════════
//  AUTH
// ═══════════════════════════════════════════════════════════════════════════
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  const db = readDB();
  const user = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (!user || user.password !== password) return res.status(401).json({ message: 'Invalid email or password' });
  res.json({ _id: user._id, name: user.name, email: user.email, role: user.role, token: "mock_jwt_token_for_local_testing" });
});

app.post('/api/auth/register', (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) return res.status(400).json({ message: 'All fields required' });
  const db = readDB();
  if (db.users.find(u => u.email.toLowerCase() === email.toLowerCase())) return res.status(400).json({ message: 'User already exists' });
  const newUser = { _id: 'user_' + Date.now(), name, email: email.toLowerCase(), password, role: 'user', createdAt: new Date().toISOString() };
  db.users.push(newUser);
  writeDB(db);
  res.status(201).json({ _id: newUser._id, name, email: newUser.email, role: 'user', token: "mock_jwt_token_for_local_testing" });
});

app.get('/api/auth/me', protect, (req, res) => {
  const db = readDB();
  const user = db.users.find(u => u._id === req.user._id);
  if (!user) return res.status(404).json({ message: 'User not found' });
  res.json({ _id: user._id, name: user.name, email: user.email, role: user.role });
});

// ═══════════════════════════════════════════════════════════════════════════
//  CATEGORIES
// ═══════════════════════════════════════════════════════════════════════════
app.get('/api/categories', (req, res) => res.json(readDB().categories));

app.post('/api/categories', protect, admin, (req, res) => {
  const { name, description, image, slug } = req.body;
  if (!name) return res.status(400).json({ message: 'Category name required' });
  const db = readDB();
  const cat = { _id: 'cat_' + Date.now(), name, description: description || '', image: image || '', slug: slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-'), createdAt: new Date().toISOString() };
  db.categories.push(cat);
  writeDB(db);
  res.status(201).json(cat);
});

app.patch('/api/categories/:id', protect, admin, (req, res) => {
  const db = readDB();
  const cat = db.categories.find(c => c._id === req.params.id);
  if (!cat) return res.status(404).json({ message: 'Category not found' });
  Object.assign(cat, req.body);
  writeDB(db);
  res.json(cat);
});

app.delete('/api/categories/:id', protect, admin, (req, res) => {
  const db = readDB();
  db.categories = db.categories.filter(c => c._id !== req.params.id);
  writeDB(db);
  res.json({ message: 'Category removed' });
});

// ═══════════════════════════════════════════════════════════════════════════
//  PRODUCTS
// ═══════════════════════════════════════════════════════════════════════════
app.get('/api/products', (req, res) => {
  const { search, category, featured, limit, page, includeInactive } = req.query;
  const db = readDB();
  let list = db.products;
  if (includeInactive !== 'true') list = list.filter(p => p.isActive !== false);
  if (search) { const s = search.toLowerCase(); list = list.filter(p => p.name.toLowerCase().includes(s) || (p.description || '').toLowerCase().includes(s)); }
  if (category) list = list.filter(p => p.category?._id === category || p.category?.slug === category);
  if (featured === 'true') list = list.filter(p => p.isFeatured);
  const pageSize = Number(limit) || 100;
  const pageNum = Number(page) || 1;
  const total = list.length;
  res.json({ products: list.slice((pageNum - 1) * pageSize, pageNum * pageSize), total, page: pageNum, pages: Math.ceil(total / pageSize) || 1 });
});

app.get('/api/products/:id', (req, res) => {
  const p = readDB().products.find(x => x._id === req.params.id || x.slug === req.params.id);
  if (!p) return res.status(404).json({ message: 'Product not found' });
  res.json(p);
});

app.post('/api/products', protect, admin, (req, res) => {
  const db = readDB();
  const catObj = db.categories.find(c => c._id === req.body.category) || { _id: req.body.category, name: 'General', slug: 'general' };
  const prod = {
    _id: 'prod_' + Date.now(),
    name: req.body.name,
    slug: req.body.slug || req.body.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    code: req.body.code || '',
    description: req.body.description || '',
    brand: req.body.brand || 'Restu India',
    category: { _id: catObj._id, name: catObj.name, slug: catObj.slug },
    price: Number(req.body.price) || 0,
    comparePrice: req.body.comparePrice ? Number(req.body.comparePrice) : undefined,
    emoji: req.body.emoji || '✨',
    images: req.body.images || [],
    tags: req.body.tags || [],
    variants: req.body.variants || [],
    isFeatured: !!req.body.isFeatured,
    isNew: !!req.body.isNew,
    isActive: req.body.isActive !== false,
    createdAt: new Date().toISOString()
  };
  db.products.push(prod);
  writeDB(db);
  res.status(201).json(prod);
});

app.patch('/api/products/:id', protect, admin, (req, res) => {
  const db = readDB();
  const p = db.products.find(x => x._id === req.params.id);
  if (!p) return res.status(404).json({ message: 'Product not found' });
  if (req.body.category && req.body.category !== p.category?._id) {
    const cat = db.categories.find(c => c._id === req.body.category);
    if (cat) p.category = { _id: cat._id, name: cat.name, slug: cat.slug };
    delete req.body.category;
  }
  ['name','slug','code','description','brand','price','comparePrice','emoji','images','tags','variants','isFeatured','isNew','isActive'].forEach(f => { if (req.body[f] !== undefined) p[f] = req.body[f]; });
  p.updatedAt = new Date().toISOString();
  writeDB(db);
  res.json(p);
});

app.delete('/api/products/:id', protect, admin, (req, res) => {
  const db = readDB();
  db.products = db.products.filter(p => p._id !== req.params.id);
  writeDB(db);
  res.json({ message: 'Product deleted' });
});

// ═══════════════════════════════════════════════════════════════════════════
//  ENQUIRIES
// ═══════════════════════════════════════════════════════════════════════════
app.get('/api/enquiries', protect, admin, (req, res) => res.json({ enquiries: readDB().enquiries }));

app.post('/api/enquiries', (req, res) => {
  const { name, message } = req.body;
  if (!name || !message) return res.status(400).json({ message: 'Name and message required' });
  const db = readDB();
  const enq = { _id: 'enq_' + Date.now(), ...req.body, status: 'new', createdAt: new Date().toISOString() };
  db.enquiries.push(enq);
  writeDB(db);
  res.status(201).json(enq);
});

app.patch('/api/enquiries/:id', protect, admin, (req, res) => {
  const db = readDB();
  const enq = db.enquiries.find(e => e._id === req.params.id);
  if (!enq) return res.status(404).json({ message: 'Enquiry not found' });
  if (req.body.status) enq.status = req.body.status;
  writeDB(db);
  res.json(enq);
});

app.delete('/api/enquiries/:id', protect, admin, (req, res) => {
  const db = readDB();
  db.enquiries = db.enquiries.filter(e => e._id !== req.params.id);
  writeDB(db);
  res.json({ message: 'Enquiry removed' });
});

// ═══════════════════════════════════════════════════════════════════════════
//  ORDERS
// ═══════════════════════════════════════════════════════════════════════════
app.get('/api/orders', protect, admin, (req, res) => {
  const db = readDB();
  let orders = [...db.orders].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  if (req.query.status) orders = orders.filter(o => o.status === req.query.status);
  res.json({ orders });
});

app.post('/api/orders', protect, (req, res) => {
  const { items, shipping, totalPrice } = req.body;
  if (!items?.length) return res.status(400).json({ message: 'Order must have items' });
  const db = readDB();
  const order = { _id: 'ord_' + Date.now(), orderNumber: 'RI-' + Date.now(), user: { _id: req.user._id, name: req.user.name, email: req.user.email }, items, shipping, totalPrice: Number(totalPrice) || 0, status: 'pending', isPaid: false, createdAt: new Date().toISOString() };
  db.orders.push(order);
  writeDB(db);
  res.status(201).json(order);
});

app.patch('/api/orders/:id/status', protect, admin, (req, res) => {
  const db = readDB();
  const order = db.orders.find(o => o._id === req.params.id);
  if (!order) return res.status(404).json({ message: 'Order not found' });
  order.status = req.body.status;
  order.updatedAt = new Date().toISOString();
  writeDB(db);
  res.json(order);
});

// ═══════════════════════════════════════════════════════════════════════════
//  USERS
// ═══════════════════════════════════════════════════════════════════════════
app.get('/api/users', protect, admin, (req, res) => {
  const db = readDB();
  const { search } = req.query;
  let users = db.users.map(u => ({ _id: u._id, name: u.name, email: u.email, role: u.role, createdAt: u.createdAt }));
  if (search) { const s = search.toLowerCase(); users = users.filter(u => u.name.toLowerCase().includes(s) || u.email.toLowerCase().includes(s)); }
  res.json({ users });
});

app.patch('/api/users/:id/role', protect, admin, (req, res) => {
  if (req.params.id === 'admin_user_id') return res.status(400).json({ message: 'Cannot change your own role' });
  const db = readDB();
  const user = db.users.find(u => u._id === req.params.id);
  if (!user) return res.status(404).json({ message: 'User not found' });
  user.role = req.body.role === 'admin' ? 'admin' : 'user';
  writeDB(db);
  res.json({ _id: user._id, name: user.name, email: user.email, role: user.role });
});

app.delete('/api/users/:id', protect, admin, (req, res) => {
  if (req.params.id === 'admin_user_id') return res.status(400).json({ message: 'Cannot delete your own account' });
  const db = readDB();
  db.users = db.users.filter(u => u._id !== req.params.id);
  writeDB(db);
  res.json({ message: 'User removed' });
});

// ═══════════════════════════════════════════════════════════════════════════
//  COUPONS
// ═══════════════════════════════════════════════════════════════════════════
app.get('/api/coupons', protect, admin, (req, res) => {
  const db = readDB();
  res.json({ coupons: db.coupons || [] });
});

app.post('/api/coupons', protect, admin, (req, res) => {
  const db = readDB();
  if (!db.coupons) db.coupons = [];
  const { code, type, value, minOrder, maxUses, expiry } = req.body;
  if (!code || !value) return res.status(400).json({ message: 'Code and value required' });
  if (db.coupons.find(c => c.code === code.toUpperCase())) return res.status(400).json({ message: 'Coupon code already exists' });
  const coupon = {
    _id: 'coupon_' + Date.now(),
    code: code.toUpperCase().trim(),
    type: type || 'percent',
    value: Number(value),
    minOrder: Number(minOrder) || 0,
    uses: 0,
    maxUses: Number(maxUses) || 999,
    active: true,
    expiry: expiry || '2027-12-31',
    createdAt: new Date().toISOString()
  };
  db.coupons.push(coupon);
  writeDB(db);
  res.status(201).json(coupon);
});

app.patch('/api/coupons/:id', protect, admin, (req, res) => {
  const db = readDB();
  if (!db.coupons) return res.status(404).json({ message: 'Coupon not found' });
  const coupon = db.coupons.find(c => c._id === req.params.id);
  if (!coupon) return res.status(404).json({ message: 'Coupon not found' });
  ['type','value','minOrder','maxUses','active','expiry'].forEach(f => { if (req.body[f] !== undefined) coupon[f] = req.body[f]; });
  writeDB(db);
  res.json(coupon);
});

app.delete('/api/coupons/:id', protect, admin, (req, res) => {
  const db = readDB();
  if (!db.coupons) return res.json({ message: 'Coupon removed' });
  db.coupons = db.coupons.filter(c => c._id !== req.params.id);
  writeDB(db);
  res.json({ message: 'Coupon removed' });
});

// ═══════════════════════════════════════════════════════════════════════════
//  SETTINGS
// ═══════════════════════════════════════════════════════════════════════════
app.get('/api/settings', protect, admin, (req, res) => {
  const db = readDB();
  res.json(db.settings || {});
});

app.patch('/api/settings', protect, admin, (req, res) => {
  const db = readDB();
  if (!db.settings) db.settings = {};
  // Deep merge
  const { notifications, ...storeFields } = req.body;
  Object.assign(db.settings, storeFields);
  if (notifications) db.settings.notifications = { ...(db.settings.notifications || {}), ...notifications };
  writeDB(db);
  res.json(db.settings);
});

// ═══════════════════════════════════════════════════════════════════════════
//  ADMIN STATS (Dashboard + Reports)
// ═══════════════════════════════════════════════════════════════════════════
app.get('/api/admin/stats', protect, admin, (req, res) => {
  const db = readDB();

  const totalRevenue  = db.orders.filter(o => o.isPaid).reduce((a, o) => a + o.totalPrice, 0);
  const totalOrders   = db.orders.length;
  const totalUsers    = db.users.length;
  const totalProducts = db.products.filter(p => p.isActive !== false).length;
  const totalEnquiries = (db.enquiries || []).length;
  const newEnquiries  = (db.enquiries || []).filter(e => e.status === 'new').length;

  // Orders by status
  const statusMap = {};
  db.orders.forEach(o => { statusMap[o.status] = (statusMap[o.status] || 0) + 1; });
  const ordersByStatus = Object.entries(statusMap).map(([k, v]) => ({ _id: k, count: v }));

  // Recent orders (last 5)
  const recentOrders = [...db.orders]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);

  // Monthly revenue — last 7 months
  const now = new Date();
  const monthlyRevenue = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const label = d.toLocaleString('en-IN', { month: 'short', year: '2-digit' });
    const monthOrders = db.orders.filter(o => {
      const created = new Date(o.createdAt);
      return created.getFullYear() === d.getFullYear() && created.getMonth() === d.getMonth();
    });
    monthlyRevenue.push({
      month: label,
      revenue: monthOrders.reduce((s, o) => s + o.totalPrice, 0),
      orders: monthOrders.length
    });
  }

  // Top products by order count
  const prodCount = {};
  db.orders.forEach(o => {
    (o.items || []).forEach(item => {
      const key = item.name || 'Unknown';
      prodCount[key] = (prodCount[key] || 0) + item.qty;
    });
  });
  const topProducts = Object.entries(prodCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, count]) => ({ name, count }));

  // Category breakdown — count products per category
  const catCount = {};
  db.products.filter(p => p.isActive !== false).forEach(p => {
    const cName = p.category?.name || 'Uncategorised';
    catCount[cName] = (catCount[cName] || 0) + 1;
  });
  const categoryBreakdown = Object.entries(catCount)
    .sort((a, b) => b[1] - a[1])
    .map(([name, count]) => ({ name, count }));

  res.json({
    totalRevenue, totalOrders, totalUsers, totalProducts,
    totalEnquiries, newEnquiries,
    ordersByStatus, recentOrders,
    monthlyRevenue, topProducts, categoryBreakdown
  });
});

// ═══════════════════════════════════════════════════════════════════════════
//  UPLOAD (mock)
// ═══════════════════════════════════════════════════════════════════════════
app.post('/api/upload', protect, admin, upload.array('images', 5), (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ message: 'No files uploaded' });
  }
  const urls = req.files.map(file => '/api/uploads/' + file.filename);
  res.status(201).json({ urls });
});

// ═══════════════════════════════════════════════════════════════════════════
//  START
// ═══════════════════════════════════════════════════════════════════════════
app.listen(PORT, () => {
  console.log(`✅ Restu India Mock API running at http://localhost:${PORT}`);
});
