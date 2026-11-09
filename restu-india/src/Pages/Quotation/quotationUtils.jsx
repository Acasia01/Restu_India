import React from "react";

export const WA_PHONE = "919217196621";

export function generateQuoteNumber() {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const rand = String(Math.floor(Math.random() * 9000) + 1000);
  return `RI-${year}${month}-${rand}`;
}

export function formatQuotationWhatsAppMessage({
  products = [],
  quoteNo,
  subtotal = 0,
  gst = 0,
  total = 0,
}) {
  const today = new Date().toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  if (!products || products.length === 0) {
    return `Hello Resatu India, I would like to request an official quotation for hospital furniture and medical equipment. Please share your catalog and price list. Thank you!`;
  }

  const fmt = (n) =>
    `₹${Number(n || 0).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  const itemsList = products
    .map((item, idx) => {
      const qty = Number(item.qty || 1);
      const price = Number(item.price || 0);
      const itemTotal = Number(item.totalPrice) || price * qty;
      const codePart = item.code ? ` (REF: ${item.code})` : "";
      const pricePart = price > 0 ? `₹${price.toLocaleString("en-IN")}` : "Price on Request";
      const totalPart = price > 0 ? fmt(itemTotal) : "—";
      return `${idx + 1}. *${item.name}*${codePart}\n   • Qty: ${qty} | Unit: ${pricePart} | Total: ${totalPart}`;
    })
    .join("\n\n");

  return `*QUOTATION INQUIRY - RESATU INDIA*
──────────────────────
*Quote No:* ${quoteNo || "RI-QUOTE"}
*Date:* ${today}

*SELECTED PRODUCTS:*
${itemsList}

──────────────────────
*Subtotal:* ${fmt(subtotal)}
*GST (18%):* ${fmt(gst)}
*Grand Total:* ${fmt(total)}
──────────────────────

*Company:* Resatu India (New Delhi)
*Website:* https://resatuindia.in

Hello Resatu India Team, please confirm product availability, delivery timeline, and the best quotation for the above items. Thank you!`;
}

export function openQuotationWhatsApp(params, targetNumber = WA_PHONE) {
  const text = formatQuotationWhatsAppMessage(params);
  const cleanNumber = targetNumber ? targetNumber.replace(/[^0-9]/g, "") : WA_PHONE;
  const url = `https://wa.me/${cleanNumber}?text=${encodeURIComponent(text)}`;
  window.open(url, "_blank", "noopener,noreferrer");
}

export const WhatsAppIcon = ({ size = 16, className = "" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    style={{ flexShrink: 0 }}
  >
    <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91C2.13 13.66 2.59 15.36 3.45 16.86L2.05 22L7.3 20.62C8.75 21.41 10.38 21.83 12.04 21.83C17.5 21.83 21.95 17.38 21.95 11.92C21.95 9.27 20.92 6.78 19.05 4.91C17.18 3.03 14.69 2 12.04 2Z" />
    <path
      d="M17.47 14.39C17.18 14.25 15.73 13.54 15.46 13.44C15.2 13.34 15.01 13.29 14.82 13.58C14.62 13.88 14.07 14.53 13.9 14.72C13.73 14.92 13.56 14.94 13.27 14.8C12.98 14.65 12.04 14.35 10.93 13.36C10.07 12.59 9.48 11.64 9.31 11.35C9.14 11.06 9.29 10.9 9.44 10.76C9.57 10.63 9.73 10.42 9.87 10.25C10.02 10.08 10.07 9.96 10.17 9.77C10.27 9.57 10.22 9.4 10.15 9.25C10.07 9.11 9.51 7.73 9.28 7.17C9.05 6.63 8.82 6.7 8.65 6.69C8.49 6.69 8.3 6.69 8.1 6.69C7.91 6.69 7.6 6.76 7.34 7.05C7.07 7.34 6.32 8.04 6.32 9.47C6.32 10.9 7.36 12.28 7.51 12.47C7.65 12.67 9.56 15.61 12.48 16.87C13.18 17.17 13.72 17.35 14.15 17.49C14.85 17.71 15.49 17.68 15.99 17.6C16.55 17.52 17.72 16.89 17.96 16.21C18.2 15.53 18.2 14.94 18.13 14.82C18.06 14.7 17.87 14.63 17.58 14.49L17.47 14.39Z"
      fill="#25D366"
    />
  </svg>
);

