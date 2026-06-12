import { useLocation, useNavigate } from 'react-router-dom'

const HIDDEN_ON = new Set(['/login', '/signup'])
const HIDDEN_PREFIXES = ['/games/', '/report/']

export default function SaveAccountBanner() {
  const location = useLocation()
  const navigate = useNavigate()
  const path = location.pathname
  const shouldHide = HIDDEN_ON.has(path) || HIDDEN_PREFIXES.some(prefix => path.startsWith(prefix))
  if (shouldHide) return null
  return (
    <div style={s.banner}>
      <span style={s.text}>Your data is temporary</span>
      <button onClick={() => navigate('/signup')} style={s.btn}>Save Account →</button>
    </div>
  )
}

const s = {
  banner: {
    position: 'fixed', bottom: '60px', left: 0, right: 0,
    backgroundColor: '#1d4ed8', padding: '0.6rem 1rem',
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    zIndex: 99, borderTop: '1px solid rgba(255,255,255,0.1)',
  },
  text: { color: 'rgba(255,255,255,0.9)', fontSize: '0.8rem' },
  btn: {
    padding: '0.35rem 0.75rem', backgroundColor: '#fff', color: '#1d4ed8',
    border: 'none', borderRadius: '6px', fontSize: '0.8rem', fontWeight: '700', cursor: 'pointer',
  },
}
