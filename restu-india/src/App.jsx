import HomePage from './Pages/Homepage/Homepage';
import Products from './Pages/Products/Products';
import Contact from './Pages/Contact/Contact';
import ProductDetail from './Pages/ProductDetail/ProductDetail';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import QuotationPage from './Pages/Quotation/QuotationPage';
import Login from './Pages/Login/Login';
import Register from './Pages/Register/Register';
import AdminPage from './Pages/Admin/AdminPage';

function App() {
  const location = useLocation();

  const path = location.pathname.replace(/\/$/, "");
  const showFloatingWA = !path.startsWith('/product') &&
    path !== '/quotation' &&
    path !== '/admin' &&
    path !== '/login' &&
    path !== '/register';

  return (
    <div className="site-wrapper">
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/products" element={<Products />} />
        <Route path="/product/:id" element={<ProductDetail />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/quotation" element={<QuotationPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {showFloatingWA && (
        <a
          href="https://wa.me/919217196621?text=Hello%20Resatu%20India%2C%20Can%20I%20get%20more%20product%20details%3F"
          target="_blank"
          rel="noreferrer"
          className="floating-whatsapp"
          aria-label="Chat on WhatsApp"
        >
          <img src="/whatsapp.png" alt="WhatsApp" />
        </a>
      )}
    </div>
  )
}

export default App