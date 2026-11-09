/**
 * Schema.org JSON-LD Structured Data Generators for Resatu India
 */

export const SITE_URL = "https://resatuindia.in";
export const COMPANY_NAME = "Resatu India";
export const COMPANY_LOGO = `${SITE_URL}/restu-india-logo.png`;
export const COMPANY_PHONE_PRIMARY = "+91-9958857545";
export const COMPANY_PHONE_SECONDARY = "+91-9217196621";
export const COMPANY_EMAIL = "resatuindia103@gmail.com";
export const INSTAGRAM_URL = "https://www.instagram.com/restuindia/";

export const COMPANY_ADDRESS = {
  "@type": "PostalAddress",
  "streetAddress": "Kh no 17/14, Plot No 16 & 17, Phase 1, Arjun Park Nangli Vihar",
  "addressLocality": "New Delhi",
  "addressRegion": "Delhi",
  "postalCode": "110043",
  "addressCountry": "IN"
};

/**
 * Organization Schema
 */
export function getOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${SITE_URL}/#organization`,
    "name": COMPANY_NAME,
    "url": SITE_URL,
    "logo": {
      "@type": "ImageObject",
      "url": COMPANY_LOGO
    },
    "description": "Premier manufacturer and supplier of hospital beds, OT equipment, ICU furniture, and medical healthcare equipment in India.",
    "email": COMPANY_EMAIL,
    "telephone": COMPANY_PHONE_PRIMARY,
    "contactPoint": [
      {
        "@type": "ContactPoint",
        "telephone": COMPANY_PHONE_PRIMARY,
        "contactType": "sales",
        "areaServed": "IN",
        "availableLanguage": ["English", "Hindi"]
      },
      {
        "@type": "ContactPoint",
        "telephone": COMPANY_PHONE_SECONDARY,
        "contactType": "customer service",
        "areaServed": "IN",
        "availableLanguage": ["English", "Hindi"]
      }
    ],
    "address": COMPANY_ADDRESS,
    "sameAs": [
      INSTAGRAM_URL,
      "https://wa.me/919217196621"
    ]
  };
}

/**
 * LocalBusiness / MedicalBusiness Schema
 */
export function getLocalBusinessSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": `${SITE_URL}/#localbusiness`,
    "name": COMPANY_NAME,
    "image": COMPANY_LOGO,
    "url": SITE_URL,
    "sameAs": [
      INSTAGRAM_URL,
      "https://wa.me/919217196621"
    ],
    "telephone": COMPANY_PHONE_PRIMARY,
    "email": COMPANY_EMAIL,
    "priceRange": "₹₹",
    "address": COMPANY_ADDRESS,
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": 28.6139,
      "longitude": 77.0340
    },
    "openingHoursSpecification": [
      {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": [
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday"
        ],
        "opens": "09:00",
        "closes": "19:00"
      }
    ]
  };
}

/**
 * WebSite Schema (with Sitelinks Searchbox)
 */
export function getWebSiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    "url": SITE_URL,
    "name": COMPANY_NAME,
    "description": "Hospital Furniture and Medical Equipment Manufacturer & Supplier India",
    "publisher": {
      "@id": `${SITE_URL}/#organization`
    },
    "potentialAction": {
      "@type": "SearchAction",
      "target": `${SITE_URL}/products?search={search_term_string}`,
      "query-input": "required name=search_term_string"
    }
  };
}

/**
 * Product Schema
 */
export function getProductSchema(product, pageUrl) {
  if (!product) return null;

  const rawImage = product.images?.[0] || product.image;
  let imageUrl = rawImage;
  if (rawImage && !rawImage.startsWith('http')) {
    imageUrl = `${SITE_URL}${rawImage.startsWith('/') ? '' : '/'}${rawImage}`;
  }

  const priceValue = product.price
    ? String(product.price).replace(/[^0-9.]/g, '')
    : "0";

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": `${pageUrl || SITE_URL}/#product-${product.id || 'item'}`,
    "name": product.name,
    "image": imageUrl || COMPANY_LOGO,
    "description": product.description || `${product.name} manufactured by Resatu India. Certified hospital medical equipment.`,
    "sku": `RESATU-${product.id || 'GENERIC'}`,
    "brand": {
      "@type": "Brand",
      "name": product.brand || COMPANY_NAME
    },
    "category": product.category_name || product.category || "Hospital Furniture",
    "offers": {
      "@type": "Offer",
      "url": pageUrl || `${SITE_URL}/products`,
      "priceCurrency": "INR",
      "price": priceValue || "0",
      "availability": "https://schema.org/InStock",
      "itemCondition": "https://schema.org/NewCondition",
      "seller": {
        "@type": "Organization",
        "name": COMPANY_NAME
      }
    }
  };
}

/**
 * BreadcrumbList Schema
 * @param {Array<{name: string, url: string}>} items
 */
export function getBreadcrumbSchema(items = []) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": item.url?.startsWith('http') ? item.url : `${SITE_URL}${item.url?.startsWith('/') ? '' : '/'}${item.url || ''}`
    }))
  };
}

/**
 * FAQPage Schema
 * @param {Array<{question: string, answer: string}>} faqs
 */
export function getFAQPageSchema(faqs = []) {
  if (!faqs || faqs.length === 0) return null;

  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map((faq) => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  };
}

/**
 * Multi-schema Graph Combiner
 */
export function combineSchemas(schemas = []) {
  const validSchemas = schemas.filter(Boolean);
  if (validSchemas.length === 0) return null;
  if (validSchemas.length === 1) return validSchemas[0];

  return {
    "@context": "https://schema.org",
    "@graph": validSchemas.map(s => {
      // Remove nested @context when nested inside @graph
      const { "@context": _, ...rest } = s;
      return rest;
    })
  };
}
