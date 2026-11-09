import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, LayoutGrid, FileText, Phone } from "lucide-react";
import { useQuote } from "../../Context/QuoteContext";
import { useAuth } from "../../Context/AuthContext";
import QuotationModal from "../../Pages/Quotation/QuotationModal";
import "./BottomNav.css";

export default function BottomNav() {
  const [isQuoteOpen, setIsQuoteOpen] = useState(false);
  const { quoteItems, totalCount } = useQuote();
  const { user } = useAuth();
  const location = useLocation();

  const activePath = location.pathname;
  const count = totalCount > 0 ? totalCount : quoteItems.length;

  return (
    <>
      <div className="bottom-nav">
        {/* HOME TAB */}
        <Link
          to="/"
          className={`bottom-nav-item ${activePath === "/" ? "active" : ""}`}
        >
          <Home size={20} />
          <span>Home</span>
        </Link>

        {/* PRODUCTS TAB */}
        <Link
          to="/products"
          className={`bottom-nav-item ${
            activePath === "/products" || activePath.startsWith("/product/")
              ? "active"
              : ""
          }`}
        >
          <LayoutGrid size={20} />
          <span>Products</span>
        </Link>

        {/* MY QUOTE TAB */}
        <button
          onClick={() => setIsQuoteOpen(true)}
          className={`bottom-nav-item bottom-nav-btn ${
            isQuoteOpen ? "active" : ""
          }`}
        >
          <div className="bottom-nav-icon-wrapper">
            <FileText size={20} />
            {count > 0 && (
              <span className="bottom-nav-badge">{count}</span>
            )}
          </div>
          <span>Quote{count > 0 ? ` (${count})` : ""}</span>
        </button>

        {/* CONTACT TAB */}
        <Link
          to="/contact"
          className={`bottom-nav-item ${
            activePath === "/contact" ? "active" : ""
          }`}
        >
          <Phone size={20} />
          <span>Contact</span>
        </Link>
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
