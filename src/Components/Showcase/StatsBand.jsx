import './Showcase.css';

const STATS = [
  { val: '5000+', label: 'Hospitals Served' },
  { val: '25+',   label: 'States Covered' },
  { val: '150+',  label: 'Products' },
  { val: '15+',   label: 'Years Experience' },
];

export default function StatsBand() {
  return (
    <section className="stats-band">
      <div className="stats-band-inner">
        {STATS.map((s, i) => (
          <div key={i} className="stat-band-item">
            <span className="stat-band-val">{s.val}</span>
            <span className="stat-band-label">{s.label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
