import { useNavigate } from 'react-router-dom'

const FEATURES = [
  'Unlimited teams',
  'Unlimited games & shot history',
  'Full shot maps & reports',
  'Shareable game reports',
  'Player stat breakdowns',
  'Game code sharing',
]

export default function Upgrade() {
  const navigate = useNavigate()

  return (
    <div style={s.page}>
      <div style={s.header}>
        <button onClick={() => navigate(-1)} style={s.back}>← Back</button>
        <h1 style={s.title}>Go Pro</h1>
      </div>

      <div style={s.content}>
        <p style={s.subtitle}>
          Unlock unlimited teams and the full ShotMap experience.
        </p>

        {/* Plans */}
        <div style={s.plans}>
          {/* Annual */}
          <div style={{ ...s.card, ...s.cardHighlighted }}>
            <div style={s.badge}>Best Value</div>
            <h2 style={s.planName}>Annual</h2>
            <div style={s.priceRow}>
              <span style={s.price}>$60</span>
              <span style={s.per}>/year</span>
            </div>
            <p style={s.perMonth}>$5.00 / month</p>
            <p style={s.saving}>Save $11.88 vs monthly</p>
            <button style={{ ...s.btn, ...s.btnPrimary }}>
              Get Started — $60/yr
            </button>
          </div>

          {/* Monthly */}
          <div style={s.card}>
            <h2 style={s.planName}>Monthly</h2>
            <div style={s.priceRow}>
              <span style={s.price}>$5.99</span>
              <span style={s.per}>/month</span>
            </div>
            <p style={s.perMonth}>Billed monthly</p>
            <div style={s.savingPlaceholder} />
            <button style={{ ...s.btn, ...s.btnSecondary }}>
              Get Started — $5.99/mo
            </button>
          </div>
        </div>

        {/* Feature list */}
        <div style={s.featureCard}>
          <p style={s.featureHeading}>Everything included in Pro:</p>
          {FEATURES.map(f => (
            <div key={f} style={s.featureRow}>
              <span style={s.check}>✓</span>
              <span style={s.featureText}>{f}</span>
            </div>
          ))}
        </div>

        <button onClick={() => navigate(-1)} style={s.backBtn}>
          Maybe later
        </button>
      </div>
    </div>
  )
}

const s = {
  page: { minHeight: '100vh', backgroundColor: '#f4f4f5', paddingBottom: '80px' },
  header: {
    backgroundColor: '#fff', padding: '1rem 1.5rem',
    borderBottom: '1px solid #e5e7eb',
    display: 'flex', alignItems: 'center', gap: '1rem',
  },
  back: { background: 'none', border: 'none', color: '#2563eb', cursor: 'pointer', fontSize: '0.875rem', padding: 0 },
  title: { fontSize: '1.25rem', fontWeight: '700', margin: 0, color: '#111' },
  content: { maxWidth: '480px', margin: '0 auto', padding: '1.5rem' },
  subtitle: { color: '#71717a', fontSize: '0.95rem', marginBottom: '1.5rem', textAlign: 'center' },
  plans: { display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.25rem' },
  card: {
    backgroundColor: '#fff', borderRadius: '14px', padding: '1.5rem',
    border: '1px solid #e5e7eb', position: 'relative',
  },
  cardHighlighted: {
    border: '2px solid #2563eb',
    boxShadow: '0 4px 20px rgba(37,99,235,0.12)',
  },
  badge: {
    position: 'absolute', top: '-12px', left: '50%',
    transform: 'translateX(-50%)',
    backgroundColor: '#2563eb', color: '#fff',
    fontSize: '0.72rem', fontWeight: '700', letterSpacing: '0.05em',
    padding: '0.2rem 0.75rem', borderRadius: '20px',
  },
  planName: { fontSize: '1rem', fontWeight: '600', color: '#111', margin: '0 0 0.75rem' },
  priceRow: { display: 'flex', alignItems: 'baseline', gap: '0.2rem', marginBottom: '0.2rem' },
  price: { fontSize: '2.25rem', fontWeight: '700', color: '#111' },
  per: { fontSize: '1rem', color: '#71717a' },
  perMonth: { fontSize: '0.85rem', color: '#71717a', margin: '0 0 0.2rem' },
  saving: { fontSize: '0.82rem', color: '#16a34a', fontWeight: '600', margin: '0 0 1.25rem' },
  savingPlaceholder: { height: '1.1rem', marginBottom: '1.25rem' },
  btn: {
    width: '100%', padding: '0.8rem', borderRadius: '10px',
    fontSize: '0.95rem', fontWeight: '700', cursor: 'pointer', border: 'none',
  },
  btnPrimary: { backgroundColor: '#2563eb', color: '#fff' },
  btnSecondary: { backgroundColor: '#f4f4f5', color: '#111' },
  featureCard: {
    backgroundColor: '#fff', borderRadius: '12px', padding: '1.25rem',
    border: '1px solid #e5e7eb', marginBottom: '1.25rem',
  },
  featureHeading: { fontSize: '0.875rem', fontWeight: '600', color: '#111', marginBottom: '0.75rem' },
  featureRow: { display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem' },
  check: { color: '#16a34a', fontWeight: '700', fontSize: '0.9rem', flexShrink: 0 },
  featureText: { fontSize: '0.875rem', color: '#374151' },
  backBtn: {
    display: 'block', width: '100%', padding: '0.75rem',
    background: 'none', border: 'none', color: '#71717a',
    fontSize: '0.875rem', cursor: 'pointer', textAlign: 'center',
  },
}
