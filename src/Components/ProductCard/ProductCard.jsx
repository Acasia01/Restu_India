import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { icons } from "../../utils/icons";
import { getImageUrl } from "../../Pages/Admin/utils/adminUtils";
import { useQuote } from "../../Context/QuoteContext";
import "./ProductCard.css";

const ArrowIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 16 16"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M3 8h10M9 4l4 4-4 4" />
  </svg>
);

const PlusIcon = () => (
  <svg
    width="13"
    height="13"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const CheckIcon = () => (
  <svg
    width="13"
    height="13"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const fmt = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`;

export default function ProductCard({ product }) {
  const navigate = useNavigate();
  const { addToQuote, isInQuote } = useQuote();
  const [justAdded, setJustAdded] = useState(false);

  const rawImg = product.images?.[0] || product.image;
  const imageUrl = rawImg ? getImageUrl(rawImg) : null;

  const categoryName = product.category?.name || "Equipment";

  // Match icon category key
  const catKey = categoryName.toLowerCase();
  const fallbackIcon = icons[catKey] || icons.other;

  const price = Number(String(product.price || 0).replace(/[^0-9.]/g, "")) || 0;
  const comparePrice = Number(String(product.comparePrice || 0).replace(/[^0-9.]/g, "")) || 0;
  const hasDiscount = comparePrice > price;
  const discountPercent = hasDiscount ? Math.round(((comparePrice - price) / comparePrice) * 100) : 0;

  const handleAddQuote = (e) => {
    e.stopPropagation();
    addToQuote(product);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1500);
  };

  return (
    <div
      className="product-card"
      onClick={() => navigate(`/product/${product._id || product.id}`)}
    >
      {/* IMAGE CONTAINER */}
      <div className="product-img">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={product.name}
            loading="lazy"
          />
        ) : (
          <div className="product-img-fallback">
            <div
              className="fallback-svg-wrapper"
              dangerouslySetInnerHTML={{
                __html: fallbackIcon,
              }}
            />
          </div>
        )}

        <span className="product-cat-badge">
          {categoryName}
        </span>

        {product.isNew && (
          <span className="product-new-badge">NEW</span>
        )}
      </div>

      {/* INFO CONTAINER */}
      <div className="product-info">
        <div className="product-header-row">
          {product.code && (
            <span className="product-code-badge">
              {product.code}
            </span>
          )}
        </div>

        <h3 className="product-name" title={product.name}>
          {product.name}
        </h3>

        {price > 0 && (
          <div className="product-pricing">
            <span className="product-price-current">{fmt(price)}</span>
            {hasDiscount && (
              <>
                <span className="product-price-compare">{fmt(comparePrice)}</span>
                <span className="product-discount-badge">{discountPercent}% OFF</span>
              </>
            )}
          </div>
        )}

        <div className="product-cta">
          <button
            className={`product-quote-btn ${justAdded ? "added" : ""}`}
            onClick={handleAddQuote}
            title="Add to Quote"
          >
            {justAdded ? <CheckIcon /> : <PlusIcon />}
          </button>

          <button
            className="product-view-btn"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/product/${product._id || product.id}`);
            }}
            title="View Details"
          >
            <span>Details</span>
            <span className="arrow-btn-icon"><ArrowIcon /></span>
          </button>
        </div>
      </div>
    </div>
  );
}