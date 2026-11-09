import React, { useRef, useMemo } from "react";
import { Link } from "react-router-dom";
import { useReactToPrint } from "react-to-print";
import Navbar from "../../Components/Navbar/Navbar";
import Footer from "../../Components/Footer/Footer";
import QuotationTemplate from "./QuotationTemplate";
import { useQuote } from "../../Context/QuoteContext";
import {
  generateQuoteNumber,
  openQuotationWhatsApp,
  WhatsAppIcon,
} from "./quotationUtils";
import "./Quotation.css";

const PrintIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="6 9 6 2 18 2 18 9" />
    <path d="M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2" />
    <rect x="6" y="14" width="12" height="8" />
  </svg>
);

const BackArrow = () => (
  <svg
    width="15"
    height="15"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M19 12H5M12 19l-7-7 7-7" />
  </svg>
);

export default function QuotationPage() {
  const componentRef = useRef(null);
  const { quoteItems } = useQuote();

  const quoteNo = useMemo(() => generateQuoteNumber(), []);

  const handlePrint = useReactToPrint({
    contentRef: componentRef,
    documentTitle: `Resatu-India-Quotation-${quoteNo}`,
  });

  const subtotal = (quoteItems || []).reduce(
    (acc, p) => acc + (Number(p.price) || 0) * (Number(p.qty) || 1),
    0
  );
  const gst = subtotal * 0.18;
  const total = subtotal + gst;

  const handleSendWhatsApp = () => {
    openQuotationWhatsApp({
      products: quoteItems,
      quoteNo,
      subtotal,
      gst,
      total,
    });
  };

  const hasItems = quoteItems && quoteItems.length > 0;

  return (
    <div className="quotation-page-wrapper">
      <Navbar />

      <main className="qp-main">
        <div className="qp-container">

          {/* ACTION TOOLBAR (HIDDEN IN PRINT) */}
          <div className="qp-toolbar no-print">
            <div className="qp-toolbar-left">
              <Link to="/products" className="qp-back-btn">
                <BackArrow />
                <span>Browse Products</span>
              </Link>
              <div className="qp-quote-tag">
                Quote No: <strong>{quoteNo}</strong>
                <span className="qp-items-count">({quoteItems.length} {quoteItems.length === 1 ? 'item' : 'items'})</span>
              </div>
            </div>

            <div className="qp-toolbar-actions">
              <button
                type="button"
                className="qp-btn-whatsapp"
                onClick={handleSendWhatsApp}
                title="Send current quotation to WhatsApp"
              >
                <WhatsAppIcon size={18} />
                <span>Send on WhatsApp</span>
              </button>

              <button
                type="button"
                className="qp-btn-print"
                onClick={handlePrint}
                title="Download or print quotation as PDF"
              >
                <PrintIcon />
                <span>Download / Print PDF</span>
              </button>
            </div>
          </div>

          {/* QUOTATION SHEET PREVIEW */}
          <div className="qp-sheet-card">
            <QuotationTemplate
              ref={componentRef}
              selectedProducts={quoteItems}
              quoteNo={quoteNo}
            />
          </div>

          {/* HELPER CARD BELOW QUOTE (HIDDEN IN PRINT) */}
          <div className="qp-bottom-helper no-print">
            <div className="qp-helper-text">
              <strong>Need a customized bulk discount?</strong>
              <p>Send this quotation directly to our sales team on WhatsApp or call our representative at +91 9217196621.</p>
            </div>
            <button
              type="button"
              className="qp-btn-whatsapp outline"
              onClick={handleSendWhatsApp}
            >
              <WhatsAppIcon size={16} />
              <span>Contact Sales on WhatsApp</span>
            </button>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}

