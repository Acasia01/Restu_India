import './Showcase.css';

const STATS = [
  { val: '5000+', label: 'Hospitals Served' },
  { val: '25+',   label: 'States Covered' },
  { val: '150+',  label: 'Products' },
  { val: '15+',   label: 'Years Experience' },
];

const FEATURES = [
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="22" height="22">
        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
      </svg>
    ),
    label: 'Premium Quality',
    desc: 'Certified Products',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="22" height="22">
        <path d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0"/>
      </svg>
    ),
    label: 'Pan India Delivery',
    desc: 'Fast & Reliable',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="22" height="22">
        <path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
      </svg>
    ),
    label: 'Manufacturer Direct',
    desc: 'Best Quality, Best Value',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="22" height="22">
        <path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
      </svg>
    ),
    label: 'Custom Solutions',
    desc: 'As Per Requirement',
  },
];

export default function Showcase() {
  return (
    <section className="trust-bar">
      <div className="trust-bar-inner">
        {FEATURES.map((f, i) => (
          <div key={i} className="trust-item">
            <div className="trust-icon">{f.icon}</div>
            <div className="trust-text">
              <span className="trust-label">{f.label}</span>
              <span className="trust-desc">{f.desc}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
