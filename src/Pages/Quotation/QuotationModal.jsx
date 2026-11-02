import React, { useRef } from "react";
import { useReactToPrint } from "react-to-print";
import QuotationTemplate from "./QuotationTemplate";
import { useQuote } from "../../Context/QuoteContext";
import "./Quotation.css";

const PrintIcon = () => (
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
    <polyline points="6 9 6 2 18 2 18 9" />
    <path d="M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2" />
    <rect x="6" y="14" width="12" height="8" />
  </svg>
);

const DocIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
    <polyline points="10 9 9 9 8 9" />
  </svg>
);

const CloseIcon = () => (
  <svg
    width="15"
    height="15"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
  >
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

export default function QuotationModal({
  isOpen,
  onClose,
  selectedItems,
}) {
  const componentRef = useRef(null);
  const { quoteItems } = useQuote();

  const handlePrint = useReactToPrint({
    contentRef: componentRef,
    documentTitle: `Resatu-India-Quotation-${Date.now()}`,
  });

  if (!isOpen) return null;

  const itemsToRender = (selectedItems && selectedItems.length > 0) ? selectedItems : quoteItems;

  return (
    <div
      className="qm-overlay"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="qm-content">

        {/* HEADER */}
        <div className="qm-header">
          <div className="qm-header-left">
            <div className="qm-header-icon">
              <DocIcon />
            </div>

            <div>
              <div className="qm-header-title">
                Generate Quotation
              </div>

              <div className="qm-header-sub">
                Preview before downloading
              </div>
            </div>
          </div>

          <button
            className="qm-close"
            onClick={onClose}
            aria-label="Close"
          >
            <CloseIcon />
          </button>
        </div>

        {/* BODY */}
        <div className="qm-body">
          <QuotationTemplate
            ref={componentRef}
            selectedProducts={itemsToRender}
          />
        </div>

        {/* FOOTER */}
        <div className="qm-footer">
          <button
            className="qm-btn-cancel"
            onClick={onClose}
          >
            Cancel
          </button>

          <button
            className="qm-btn-print"
            onClick={handlePrint}
          >
            <PrintIcon />
            Download / Print PDF
          </button>
        </div>

      </div>
    </div>
  );
}