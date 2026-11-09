import React, { forwardRef } from "react";
import { useQuote } from "../../Context/QuoteContext";
import { getImageUrl } from "../Admin/utils/adminUtils";
import { updateSEO, getBreadcrumbSchema } from "../../utils/seo";
import { generateQuoteNumber } from "./quotationUtils";
import "./Quotation.css";

const TERMS = [
  "Quotation valid for 30 days from issue date",
  "Delivery within 7–10 working days after confirmation",
  "1 Year manufacturer warranty on all products",
  "50% advance payment required to confirm order",
  "Prices subject to change without prior notice",
];

const LogoIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#0a3d6b"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="2" y="7" width="20" height="10" rx="2" />
    <path d="M6 7V5a2 2 0 012-2h8a2 2 0 012 2v2" />
    <circle cx="12" cy="12" r="1.5" fill="#0a3d6b" stroke="none" />
  </svg>
);

const QuotationTemplate = forwardRef(({ selectedProducts, quoteNo: externalQuoteNo }, ref) => {
  const { quoteItems } = useQuote();

  React.useEffect(() => {
    updateSEO({
      title: "Request Quotation",
      description: "Generate instant quotation for hospital beds, ICU furniture, OT equipment, and ward supplies from Resatu India.",
      keywords: "hospital equipment quotation, medical furniture estimate, hospital beds price list India",
      schema: getBreadcrumbSchema([
        { name: "Home", url: "/" },
        { name: "Quotation", url: "/quotation" }
      ])
    });
  }, []);

  const quoteNo = React.useMemo(
    () => externalQuoteNo || generateQuoteNumber(),
    [externalQuoteNo]
  );

  const productsToRender = (selectedProducts && selectedProducts.length > 0)
    ? selectedProducts
    : (quoteItems || []);

  const today = new Date().toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  const subtotal = productsToRender.reduce(
    (acc, p) => acc + (Number(p.price) || 0) * (Number(p.qty) || 1),
    0
  );

  const gst = subtotal * 0.18;
  const total = subtotal + gst;

  const fmt = (n) =>
    `₹${Number(n || 0).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  return (
    <div ref={ref} className="qt-wrap">

      {/* HEADER */}
      <div className="qt-header">
        <div>
          <div className="qt-logo-row">
            <div className="qt-logo-box">
              <LogoIcon />
            </div>

            <div className="qt-company-name">Resatu India</div>
          </div>

          <div className="qt-company-meta">
            <span>Kh no 17/14, Plot No 16 &amp; 17, Phase 1</span>
            <span>Arjun Park Nangli Vihar, New Delhi — 110043</span>
            <span>📞 9958857545 &nbsp;|&nbsp; 9217196621</span>
            <span>✉ resatuindia103@gmail.com</span>
          </div>
        </div>

        <div className="qt-label-block">
          <div className="qt-label-badge">Quotation</div>

          <div className="qt-meta-row">
            Quote No: <strong>{quoteNo}</strong>
          </div>

          <div className="qt-meta-row">
            Date: <strong>{today}</strong>
          </div>

          <div className="qt-meta-row">
            Valid till:{" "}
            <strong>
              {new Date(Date.now() + 30 * 864e5).toLocaleDateString("en-IN", {
                day: "2-digit",
                month: "long",
                year: "numeric",
              })}
            </strong>
          </div>
        </div>
      </div>

      {/* TABLE */}
      <table className="qt-table">
        <thead>
          <tr>
            <th style={{ width: "36px" }}>#</th>
            <th>Product Details</th>
            <th>Category</th>
            <th>Qty</th>
            <th>Unit Price</th>
            <th>Amount</th>
          </tr>
        </thead>

        <tbody>
          {productsToRender.length > 0 ? (
            productsToRender.map((item, i) => {
              const rawImg = item.image || item.images?.[0];
              const imgUrl = rawImg ? (rawImg.startsWith("http") || rawImg.startsWith("/") ? rawImg : getImageUrl(rawImg)) : null;
              const unitPrice = Number(item.price || 0);
              const qty = Number(item.qty || 1);
              const itemTotal = Number(item.totalPrice) || (unitPrice * qty);

              return (
                <tr key={item.id || item._id || i}>
                  <td
                    style={{
                      color: "#94a3b8",
                      fontSize: "12px",
                    }}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </td>

                  <td className="qt-td-name">
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      {imgUrl && (
                        <img
                          src={imgUrl}
                          alt={item.name}
                          style={{
                            width: "36px",
                            height: "36px",
                            objectFit: "cover",
                            borderRadius: "6px",
                            border: "1px solid #e2e8f0",
                            flexShrink: 0,
                          }}
                          onError={(e) => { e.target.style.display = "none"; }}
                        />
                      )}
                      <div>
                        <div style={{ fontWeight: "700", color: "#0f172a" }}>{item.name}</div>
                        {item.code && (
                          <div style={{ fontSize: "11px", color: "#64748b", fontFamily: "monospace" }}>
                            REF: {item.code}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>

                  <td>
                    <span className="qt-td-cat">
                      {item.category?.name || item.category || "Equipment"}
                    </span>
                  </td>

                  <td>{qty}</td>

                  <td>{fmt(unitPrice)}</td>

                  <td>{fmt(itemTotal)}</td>
                </tr>
              );
            })
          ) : (
            <tr>
              <td colSpan={6} className="qt-empty">
                No products selected in quotation
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* BOTTOM */}
      <div className="qt-bottom">

        {/* TERMS */}
        <div className="qt-terms">
          <div className="qt-terms-title">
            Terms &amp; Conditions
          </div>

          <ul>
            {TERMS.map((t) => (
              <li key={t}>
                <span className="qt-terms-dot" />
                {t}
              </li>
            ))}
          </ul>
        </div>

        {/* SUMMARY */}
        <div className="qt-summary">

          <div className="qt-sum-row">
            <span className="sr-label">Subtotal</span>
            <span className="sr-val">{fmt(subtotal)}</span>
          </div>

          <div className="qt-sum-row">
            <span className="sr-label">GST (18%)</span>
            <span className="sr-val">{fmt(gst)}</span>
          </div>

          <div className="qt-sum-total">
            <span className="t-label">Grand Total</span>
            <span className="t-val">{fmt(total)}</span>
          </div>

        </div>
      </div>

      {/* FOOTER */}
      <div className="qt-note">

        <div className="qt-note-left">
          <strong>Thank you for your interest</strong>

          For queries, contact us at resatuindia103@gmail.com
          <br />
          or call +91 9958857545 / +91 9217196621
        </div>

        <div className="qt-sig-box">
          <div className="qt-sig-line" />

          <div className="qt-sig-label">
            Authorised Signatory
          </div>
        </div>

      </div>
    </div>
  );
});

QuotationTemplate.displayName = "QuotationTemplate";

export default QuotationTemplate;