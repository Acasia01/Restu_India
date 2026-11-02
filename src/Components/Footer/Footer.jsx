import { Link } from 'react-router-dom';
import './footer.css';

export default function Footer() {
  return (
    <footer>
      <div className="footer-top">
        <div className="footer-brand">
          <div className="name">Resatu India</div>
          <p>Aaram aur Bharosa — Premium hospital furniture and mattresses for healthcare facilities across India.</p>
        </div>
        
        <div className="footer-links-grid">
          <div className="footer-links">
            <h4>Products</h4>
            <ul>
              <li><Link to="/products">ICU Beds</Link></li>
              <li><Link to="/products">Fowler Beds</Link></li>
              <li><Link to="/products">Medical Trolleys</Link></li>
              <li><Link to="/products">OT Tables</Link></li>
            </ul>
          </div>

          <div className="footer-links">
            <h4>Company</h4>
            <ul>
              <li><Link to="/">About Us</Link></li>
              <li><Link to="/products">Catalog</Link></li>
              <li><Link to="/contact">Contact</Link></li>
            </ul>
          </div>

          <div className="footer-links">
            <h4>Support</h4>
            <ul>
              <li><Link to="/quotation">Get a Quote</Link></li>
              <li><Link to="/contact">Warranty</Link></li>
              <li><Link to="/contact">Help Center</Link></li>
            </ul>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <p>© 2026 Resatu India. All rights reserved.</p>
        <p>Kh no 17/14, Arjun Park Nangli Vihar, New Delhi — 110043</p>
      </div>
    </footer>
  );
}