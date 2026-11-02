import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../services/api";
import { API_BASE, getImageUrl } from "../Admin/utils/adminUtils";
import Navbar from "../../Components/Navbar/Navbar";
import Footer from "../../Components/Footer/Footer";
import "./ProductDetail.css";
import QuotationModal from "../Quotation/QuotationModal";
import { useQuote } from "../../Context/QuoteContext";


const WA_PHONE = "919217196621";

const FEATURES = [
  "Medical Grade Materials",
  "Ergonomic Design",
  "ISO Certified Quality",
  "Easy Maintenance & Cleaning",
  "Pan India Delivery Available",
];

const CheckIcon = () => (
  <svg
    width="11"
    height="11"
    viewBox="0 0 12 12"
    fill="none"
    stroke="#059669"
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M2 6l3 3 5-5" />
  </svg>
);

const BackArrow = () => (
  <svg
    width="15"
    height="15"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
  >
    <path d="M19 12H5M12 19l-7-7 7-7" />
  </svg>
);

import { updateSEO, getProductSchema, getBreadcrumbSchema } from "../../utils/seo";

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToQuote, quoteItems, totalCount } = useQuote();

  const [isQuoteOpen, setIsQuoteOpen] = useState(false);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [addedRecently, setAddedRecently] = useState(false);


  useEffect(() => {
    api
      .get(`products/${id}`)
      .then((res) => {
        setProduct(res.data);
      })
      .catch((err) => {
        console.error(err);
        setError("Failed to load product details.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [id]);

  useEffect(() => {
    if (product) {
      const rawImage = product.images?.[0] || product.image;
      const imageUrl = getImageUrl(rawImage);

      const breadcrumbs = [
        { name: "Home", url: "/" },
        { name: "Products", url: "/products" },
        { name: product.name, url: `/product/${product.id}` }
      ];

      updateSEO({
        title: product.name,
        description: product.description ? product.description.slice(0, 160) : `Buy ${product.name} from Resatu India - High quality hospital and medical equipment.`,
        keywords: `${product.name}, ${product.brand || 'Resatu India'}, hospital furniture, medical equipment India, buy ${product.name}`,
        ogImage: imageUrl || '/restu-india-logo.png',
        ogType: 'product',
        schema: [
          getProductSchema(product, window.location.href),
          getBreadcrumbSchema(breadcrumbs)
        ]
      });
    }
  }, [product]);


  if (loading) {
    return (
      <div className="pd-page">
        <Navbar />

        <div className="pd-loader">
          <div className="pd-spinner" />
          Loading product details...
        </div>

        <Footer />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="pd-page">
        <Navbar />

        <div className="pd-loader">Product not found.</div>

        <Footer />
      </div>
    );
  }

  const rawImage = product.images?.[0] || product.image;

  const imageUrl = getImageUrl(rawImage);

  const waMsg = `Hello Resatu India, I'm interested in: ${product.name} (${
    product.code || ""
  }). Please share more details.`;

  const waUrl = `https://wa.me/${WA_PHONE}?text=${encodeURIComponent(
    waMsg
  )}`;

  return (
    <div className="pd-page">
      <Navbar />

      {/* BREADCRUMB */}
      <div className="pd-topbar">
        <button className="pd-back" onClick={() => navigate(-1)}>
          <BackArrow />
          Products
        </button>

        <span className="pd-breadcrumb-sep">/</span>

        <span className="pd-breadcrumb-cur">{product.name}</span>
      </div>

      {/* MAIN */}
      <div className="pd-container">
        <div className="pd-grid">

          {/* LEFT */}
          <div className="pd-image-panel">
            <div className="pd-image-box">
              {imageUrl ? (
                <img src={imageUrl} alt={product.name} />
              ) : (
                <div className="pd-image-fallback">
                  <svg
                    width="56"
                    height="56"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#94a3b8"
                    strokeWidth="1"
                    opacity="0.5"
                  >
                    <rect x="2" y="7" width="20" height="10" rx="2" />
                    <path d="M6 7V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v2" />
                  </svg>

                  No image available
                </div>
              )}
            </div>
          </div>

          {/* RIGHT */}
          <div className="pd-info">

            {product.category?.name && (
              <span className="pd-cat-badge">
                {product.category.name}
              </span>
            )}

            <h1 className="pd-name">{product.name}</h1>

            {product.code && (
              <span className="pd-code">
                <span className="pd-code-label">REF</span>
                {product.code}
              </span>
            )}

            <div className="pd-divider" />

            {/* Description */}
            <div className="pd-section">
              <div className="pd-section-title">
                Product Overview
              </div>

              <p className="pd-description">
                {product.description ||
                  "High-quality medical grade equipment designed for durability and patient comfort. Built to meet the demanding requirements of modern healthcare facilities across India."}
              </p>
            </div>

            {/* Features */}
            <div className="pd-section">
              <div className="pd-section-title">
                Key Features
              </div>

              <ul className="pd-features">
                {FEATURES.map((f) => (
                  <li key={f}>
                    <span className="pd-check">
                      <CheckIcon />
                    </span>

                    {f}
                  </li>
                ))}
              </ul>
            </div>

            {/* CTA */}
            <div className="pd-actions">

              <button
                className="pd-quote-btn"
                onClick={() => {
                  addToQuote(product);
                  setAddedRecently(true);
                  setTimeout(() => setAddedRecently(false), 2000);
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 5v14M5 12h14" />
                </svg>
                {addedRecently ? "Added to Quote ✓" : "Add to Quote"}
              </button>

              <button
                className="pd-quote-btn pd-view-quote-btn"
                onClick={() => setIsQuoteOpen(true)}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                  <polyline points="10 9 9 9 8 9" />
                </svg>
                {totalCount > 0 ? `View Quote (${totalCount})` : "View Quotation"}
              </button>

              {isQuoteOpen && (
                <QuotationModal
                  isOpen={isQuoteOpen}
                  onClose={() => setIsQuoteOpen(false)}
                  selectedItems={quoteItems}
                />
              )}

              <a
                className="pd-wa-btn"
                href={waUrl}
                target="_blank"
                rel="noreferrer"
              >
                <img src="/whatsapp.png" alt="WhatsApp" />
                Enquire on WhatsApp
              </a>

            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}