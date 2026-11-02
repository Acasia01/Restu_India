import { useState, useEffect } from 'react';
import Navbar from '../../Components/Navbar/Navbar';
import Footer from '../../Components/Footer/Footer';
import api from '../../services/api';
import './Contact.css';

const WA_PHONE = "919217196621";
const WA_MSG = "Hello Resatu India, I'd like to get in touch!";
const WA_URL = `https://wa.me/${WA_PHONE}?text=${encodeURIComponent(WA_MSG)}`;

const INITIAL_FORM = {
  name: '',
  phone: '',
  category: '',
  purpose: '',
  message: ''
};

const CONTACT_ITEMS = [
  {
    label: "Phone",
    value: "9958857545  |  9217196621",
    href: "tel:+919958857545",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
      </svg>
    ),
  },
  {
    label: "Email",
    value: "resatuindia103@gmail.com",
    href: "mailto:resatuindia103@gmail.com",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8" />
        <path d="M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    label: "Address",
    value: "Kh no 17/14, Plot No 16 & 17, Phase 1\nArjun Park Nangli Vihar, New Delhi\nDelhi State, PIN: 110043",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        <circle cx="12" cy="11" r="3" />
      </svg>
    ),
  },
  {
    label: "Website",
    value: "resatuindia.in",
    href: "https://resatuindia.in",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10" />
        <path d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 014-10z" />
      </svg>
    ),
  },
];

import {
  updateSEO,
  getLocalBusinessSchema,
  getBreadcrumbSchema
} from '../../utils/seo';

export default function Contact() {
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(INITIAL_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    const breadcrumbs = [
      { name: "Home", url: "/" },
      { name: "Contact Us", url: "/contact" }
    ];

    updateSEO({
      title: "Contact Us & Inquiries",
      description: "Contact Resatu India for hospital furniture inquiries, bulk equipment orders, custom setups, and pricing quotes.",
      keywords: "contact Resatu India, hospital furniture inquiry, medical equipment supplier India, hospital bed quote",
      schema: [
        {
          "@context": "https://schema.org",
          "@type": "ContactPage",
          "name": "Contact Resatu India",
          "description": "Get in touch with Resatu India for hospital furniture inquiries and bulk orders.",
          "url": window.location.href
        },
        getLocalBusinessSchema(),
        getBreadcrumbSchema(breadcrumbs)
      ]
    });

    api
      .get('categories/')
      .then((res) => setCategories(res.data))
      .catch(console.error);
  }, []);


  const handleChange = (e) =>
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });

  const handleSubmit = async (e) => {
    e.preventDefault();

    setSubmitting(true);
    setToast(null);

    try {
      await api.post('enquiries/', form);

      setForm(INITIAL_FORM);

      setToast({
        type: 'success',
        msg: "✓  Enquiry sent! We'll contact you soon.",
      });
    } catch {
      setToast({
        type: 'error',
        msg: '✗  Something went wrong. Please try again.',
      });
    } finally {
      setSubmitting(false);

      setTimeout(() => {
        setToast(null);
      }, 5000);
    }
  };

  return (
    <div className="contact-page">
      <Navbar />
      <div className="contact-body">

        {/* LEFT — INFO */}
        <div className="contact-info-card">
          <div className="contact-info-title">
            Contact Information
          </div>

          {CONTACT_ITEMS.map((item) => (
            <div className="contact-row" key={item.label}>
              <div className="contact-icon-box">
                {item.icon}
              </div>

              <div className="contact-detail-text">
                <div className="ci-label">
                  {item.label}
                </div>

                {item.href ? (
                  <a
                    href={item.href}
                    className="ci-val"
                    target={
                      item.href.startsWith('http')
                        ? '_blank'
                        : undefined
                    }
                    rel="noreferrer"
                  >
                    {item.value}
                  </a>
                ) : (
                  <div
                    className="ci-val"
                    style={{ whiteSpace: 'pre-line' }}
                  >
                    {item.value}
                  </div>
                )}
              </div>
            </div>
          ))}

          <a
            className="contact-wa-cta"
            href={WA_URL}
            target="_blank"
            rel="noreferrer"
          >
            <img
              src="/whatsapp.png"
              alt="WhatsApp"
            />

            <div className="contact-wa-cta-text">
              <div className="line1">
                Chat on WhatsApp
              </div>

              <div className="line2">
                +91 92171 96621
              </div>
            </div>
          </a>
        </div>

        {/* RIGHT — FORM */}
        <div className="contact-form-card">
          <div className="contact-form-title">
            Send an Enquiry
          </div>

          <form onSubmit={handleSubmit}>
            <div className="cf-grid">

              <div className="cf-group">
                <label className="cf-label">
                  Full Name <span>*</span>
                </label>

                <input
                  type="text"
                  name="name"
                  placeholder="Your full name"
                  value={form.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="cf-group">
                <label className="cf-label">
                  Phone Number <span>*</span>
                </label>

                <input
                  type="tel"
                  name="phone"
                  placeholder="+91 XXXXX XXXXX"
                  value={form.phone}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="cf-group">
                <label className="cf-label">
                  Product Category <span>*</span>
                </label>

                <div className="cf-select-wrap">
                  <select
                    name="category"
                    value={form.category}
                    onChange={handleChange}
                    required
                  >
                    <option value="">
                      Select a category...
                    </option>

                    {categories.map((cat) => (
                      <option
                        key={cat.id}
                        value={cat.id}
                      >
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="cf-group">
                <label className="cf-label">
                  Purpose <span>*</span>
                </label>

                <div className="cf-select-wrap">
                  <select
                    name="purpose"
                    value={form.purpose}
                    onChange={handleChange}
                    required
                  >
                    <option value="">
                      Select purpose...
                    </option>

                    <option value="Reselling">
                      Reselling
                    </option>

                    <option value="Personal Use">
                      Personal Use
                    </option>

                    <option value="Hospital/Clinic Setup">
                      Hospital / Clinic Setup
                    </option>
                  </select>
                </div>
              </div>

              <div className="cf-group full">
                <label className="cf-label">
                  Message <span>*</span>
                </label>

                <textarea
                  name="message"
                  placeholder="Tell us about your requirements, quantity needed, delivery location..."
                  value={form.message}
                  onChange={handleChange}
                  required
                />
              </div>

            </div>

            <button
              className="cf-submit"
              type="submit"
              disabled={submitting}
            >
              {submitting
                ? "Sending…"
                : "Send Enquiry →"}
            </button>

            {toast && (
              <div className={`cf-toast ${toast.type}`}>
                {toast.msg}
              </div>
            )}
          </form>
        </div>

      </div>

      <Footer />
    </div>
  );
}