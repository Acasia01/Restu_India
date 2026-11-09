const path = require('path');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const connectDB = require('./config/db');
require('dotenv').config();

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(helmet({ crossOriginResourcePolicy: false }));

// CORS - allow a comma-separated list of origins from ALLOWED_ORIGINS (.env),
// falling back to CLIENT_URL for backwards compatibility, or '*' if neither is set.
// Local dev origins (Vite) are always allowed so the admin panel works out of the box.
const DEV_ORIGINS = ['http://localhost:5173', 'http://127.0.0.1:5173'];

const configuredOrigins = (process.env.ALLOWED_ORIGINS || process.env.CLIENT_URL || '*')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

const allowedOrigins = configuredOrigins.includes('*')
  ? '*'
  : [...new Set([...configuredOrigins, ...DEV_ORIGINS])];

app.use(
  cors({
    origin: allowedOrigins,
  })
);
app.use(express.json());
app.use(morgan('dev'));


app.get('/api', (req, res) => {
  res.json({
    message: 'Restu India API Running'
  });
});

// Serve uploaded product images
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/products', require('./routes/products'));
app.use('/api/enquiries', require('./routes/enquiries'));
app.use('/api/categories', require('./routes/categories'));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/upload', require('./routes/upload'));

app.get('/', (req, res) => {
  res.send('Welcome to the Restu India API');
});

// Health check
app.get('/health', (req, res) => res.json({ status: 'ok', timestamp: new Date() }));

// 404
app.use((req, res) => res.status(404).json({ error: 'Route not found' }));

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(res.statusCode && res.statusCode !== 200 ? res.statusCode : err.status || 500).json({
    message: err.message || 'Internal server error',
    error: err.message || 'Internal server error',
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Restu India API running on port ${PORT}`));
