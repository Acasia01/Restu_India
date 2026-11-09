import { useEffect } from 'react';

/**
 * SchemaMarkup Component
 * Injects or renders JSON-LD structured data into the document head or inline.
 *
 * Usage:
 * <SchemaMarkup schema={getOrganizationSchema()} />
 * or
 * <SchemaMarkup schema={[getOrganizationSchema(), getLocalBusinessSchema()]} />
 */
export default function SchemaMarkup({ schema, id = "dynamic-page-schema" }) {
  useEffect(() => {
    if (!schema) return;

    let script = document.getElementById(id);
    if (!script) {
      script = document.createElement('script');
      script.id = id;
      script.type = 'application/ld+json';
      document.head.appendChild(script);
    }

    const payload = Array.isArray(schema)
      ? {
          "@context": "https://schema.org",
          "@graph": schema.map((s) => {
            if (s && s["@context"]) {
              const { "@context": _, ...rest } = s;
              return rest;
            }
            return s;
          })
        }
      : schema;

    script.textContent = JSON.stringify(payload, null, 2);

    return () => {
      const el = document.getElementById(id);
      if (el) el.remove();
    };
  }, [schema, id]);

  return null;
}
