/**
 * Lightweight client-side SEO utility for managing dynamic metadata, OpenGraph tags, and JSON-LD structured data
 */

export function updateSEO({
  title,
  description,
  keywords,
  canonicalUrl,
  ogType = 'website',
  ogImage = '/restu-india-logo.png',
  schema
}) {
  const defaultTitle = "Resatu India | Premier Hospital Furniture & Medical Equipment Manufacturer";
  const defaultDesc = "Resatu India is a premier manufacturer and supplier of hospital beds, OT equipment, ward furniture, medical mattresses, and healthcare solutions across India.";
  const defaultKeywords = "hospital furniture, hospital beds, OT equipment, operation theatre table, medical furniture India, ward furniture, healthcare equipment manufacturer";

  const fullTitle = title ? `${title} | Resatu India` : defaultTitle;
  const fullDesc = description || defaultDesc;
  const fullKeywords = keywords || defaultKeywords;
  const currentUrl = canonicalUrl || window.location.href;

  // 1. Update Title
  document.title = fullTitle;

  // 2. Helper to set or create meta tag
  const setMeta = (nameAttr, nameValue, content) => {
    if (!content) return;
    let element = document.querySelector(`meta[${nameAttr}="${nameValue}"]`);
    if (!element) {
      element = document.createElement('meta');
      element.setAttribute(nameAttr, nameValue);
      document.head.appendChild(element);
    }
    element.setAttribute('content', content);
  };

  // Standard Meta Tags
  setMeta('name', 'description', fullDesc);
  setMeta('name', 'keywords', fullKeywords);

  // OpenGraph Tags
  setMeta('property', 'og:title', fullTitle);
  setMeta('property', 'og:description', fullDesc);
  setMeta('property', 'og:type', ogType);
  setMeta('property', 'og:url', currentUrl);
  setMeta('property', 'og:image', ogImage.startsWith('http') ? ogImage : `${window.location.origin}${ogImage}`);
  setMeta('property', 'og:site_name', 'Resatu India');

  // Twitter Cards
  setMeta('name', 'twitter:card', 'summary_large_image');
  setMeta('name', 'twitter:title', fullTitle);
  setMeta('name', 'twitter:description', fullDesc);
  setMeta('name', 'twitter:image', ogImage.startsWith('http') ? ogImage : `${window.location.origin}${ogImage}`);

  // Canonical Link
  let canonicalLink = document.querySelector('link[rel="canonical"]');
  if (!canonicalLink) {
    canonicalLink = document.createElement('link');
    canonicalLink.setAttribute('rel', 'canonical');
    document.head.appendChild(canonicalLink);
  }
  canonicalLink.setAttribute('href', currentUrl);

  // Dynamic JSON-LD Schema
  const schemaId = 'dynamic-page-schema';
  let schemaScript = document.getElementById(schemaId);
  if (schema) {
    if (!schemaScript) {
      schemaScript = document.createElement('script');
      schemaScript.id = schemaId;
      schemaScript.type = 'application/ld+json';
      document.head.appendChild(schemaScript);
    }

    const payload = Array.isArray(schema)
      ? {
          "@context": "https://schema.org",
          "@graph": schema.filter(Boolean).map((s) => {
            if (s && s["@context"]) {
              const { "@context": _, ...rest } = s;
              return rest;
            }
            return s;
          })
        }
      : schema;

    schemaScript.textContent = JSON.stringify(payload, null, 2);
  } else if (schemaScript) {
    schemaScript.remove();
  }
}

export * from './schema';

