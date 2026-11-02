export default function StatCard({ icon, label, value, sub, accent }) {
  return (
    <div style={{ background: '#fff', border: '1.5px solid #EDE8E3', borderRadius: 12, padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 22 }}>{icon}</span>
        <span style={{ fontSize: 11, color: '#9CA3AF', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>{label}</span>
      </div>
      <div style={{ fontSize: '1.9rem', fontWeight: 800, color: accent || '#1A1218', fontFamily: "'Bebas Neue', sans-serif", letterSpacing: '0.02em' }}>{value}</div>
      {sub && <div style={{ fontSize: 12, color: '#9CA3AF' }}>{sub}</div>}
    </div>
  );
}
