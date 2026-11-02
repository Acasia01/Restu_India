import { STATUS_COLORS } from '../utils/adminUtils';

export default function Badge({ status }) {
  const s = STATUS_COLORS[status] || { bg: '#F3F4F6', color: '#374151' };

  return (
    <span
      style={{
        background: s.bg,
        color: s.color,
        padding: '2px 10px',
        borderRadius: 20,
        fontSize: 11,
        fontWeight: 700,
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
      }}
    >
      {status}
    </span>
  );
}
