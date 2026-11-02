import { Link, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import QuotationModal from "../../Pages/Quotation/QuotationModal.jsx";
import { useAuth } from "../../Context/AuthContext";
import { useQuote } from "../../Context/QuoteContext";
import "./Navbar.css";

const NAV_LINKS = [
  { to: "/", label: "Home" },
  { to: "/products", label: "Products" },
  { to: "/contact", label: "Contact Us" },
];

const WA_PHONE = "919217196621";
const WA_MSG = "Hello Resatu India, Can I get more product details?";
const WA_URL = `https://wa.me/${WA_PHONE}?text=${encodeURIComponent(WA_MSG)}`;

export default function Navbar() {
  const [isQuoteOpen, setIsQuoteOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { user } = useAuth();
  const { quoteItems, totalCount } = useQuote();

  const location = useLocation();

  const quoteDisplayCount = totalCount > 0 ? totalCount : quoteItems.length;
  const quoteLabel = quoteDisplayCount > 0 ? `Quote (${quoteDisplayCount})` : "Get Quote";

  // Close drawer on route change
  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  // Close on outside click
  useEffect(() => {
    if (!menuOpen) return;

    const handle = (e) => {
      if (
        !e.target.closest(".navbar") &&
        !e.target.closest(".mobile-drawer")
      ) {
        setMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handle);

    return () => document.removeEventListener("mousedown", handle);
  }, [menuOpen]);

  return (
    <>
      <nav className="navbar">
        {/* LOGO */}
        <Link to="/" className="nav-logo">
          <div className="nav-logo-shield">
            <img
              src="/restu-india-logo.png"
              alt="Resatu India"
              className="nav-logo-img"
            />
          </div>

          <div className="nav-brand">
            <div className="name">Resatu India</div>
            <div className="tagline">Aaram aur Bharosa</div>
          </div>
        </Link>

        {/* DESKTOP LINKS */}
        <div className="nav-links">
          {NAV_LINKS.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className={`nav-link ${
                location.pathname === l.to ? "active" : ""
              }`}
            >
              {l.label}
            </Link>
          ))}
        </div>

        {/* DESKTOP ACTIONS */}
        <div className="nav-actions">
          <a
            className="whatsapp-btn"
            href={WA_URL}
            target="_blank"
            rel="noreferrer"
          >
            <img src="/whatsapp.png" alt="WhatsApp" />
            <span>+91 92171 96621</span>
          </a>

          <button
            className="nav-cta"
            onClick={() => setIsQuoteOpen(true)}
          >
            {quoteLabel}
          </button>
        </div>

        {/* HAMBURGER */}
        <div
          className="menu-toggle"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </div>
      </nav>

      {/* MOBILE DRAWER */}
      <div className={`mobile-drawer ${menuOpen ? "open" : ""}`}>
        {NAV_LINKS.map((l) => (
          <Link
            key={l.to}
            to={l.to}
            className={`mob-link ${
              location.pathname === l.to ? "active" : ""
            }`}
          >
            {l.label}
          </Link>
        ))}

        <div className="mob-divider" />

        <div className="mob-actions">
          <a
            className="mob-whatsapp"
            href={WA_URL}
            target="_blank"
            rel="noreferrer"
          >
            <img src="/whatsapp.png" alt="WhatsApp" />
            +91 92171 96621
          </a>

          <button
            className="mob-cta"
            onClick={() => {
              setIsQuoteOpen(true);
              setMenuOpen(false);
            }}
          >
            {quoteLabel}
          </button>
        </div>
      </div>

      {isQuoteOpen && (
        <QuotationModal
          isOpen={isQuoteOpen}
          onClose={() => setIsQuoteOpen(false)}
          selectedItems={quoteItems}
        />
      )}
    </>
  );
}