import { useLocation, useNavigate } from 'react-router-dom'

const TABS = [
  {
    label: 'Teams',
    path: '/',
    icon: (active) => {
      let strokeColor = '#9ca3af'
      if (active) strokeColor = '#2563eb'
      return (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={strokeColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
          <circle cx="9" cy="7" r="4"/>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
          <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
        </svg>
      )
    },
  },
  {
    label: 'Join',
    path: '/join',
    icon: (active) => {
      let strokeColor = '#9ca3af'
      if (active) strokeColor = '#2563eb'
      return (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={strokeColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"/>
          <line x1="12" y1="8" x2="12" y2="16"/>
          <line x1="8" y1="12" x2="16" y2="12"/>
        </svg>
      )
    },
  },
  {
    label: 'Account',
    path: '/account',
    icon: (active) => {
      let strokeColor = '#9ca3af'
      if (active) strokeColor = '#2563eb'
      return (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={strokeColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
          <circle cx="12" cy="7" r="4"/>
        </svg>
      )
    },
  },
]

// Pages where the tab bar should be hidden
const HIDDEN_ON = new Set(['/login', '/signup'])
const HIDDEN_PREFIXES = ['/games/']

export default function TabBar() {
  const location = useLocation()
  const navigate = useNavigate()
  const path = location.pathname

  const shouldHide =
    HIDDEN_ON.has(path) ||
    HIDDEN_PREFIXES.some(prefix => path.startsWith(prefix)) ||
    path.startsWith('/report/')

  if (shouldHide) return null

  return (
    <div style={s.bar}>
      {TABS.map(tab => {
        const active = path === tab.path
        let labelColor = '#9ca3af'
        if (active) labelColor = '#2563eb'
        return (
          <button
            key={tab.path}
            onClick={() => navigate(tab.path)}
            style={s.tab}
          >
            {tab.icon(active)}
            <span style={{ ...s.label, color: labelColor }}>
              {tab.label}
            </span>
          </button>
        )
      })}
    </div>
  )
}

const s = {
  bar: {
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    height: '60px',
    backgroundColor: '#fff',
    borderTop: '1px solid #e5e7eb',
    display: 'flex',
    zIndex: 100,
    paddingBottom: 'env(safe-area-inset-bottom)',
  },
  tab: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '2px',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '0.25rem',
  },
  label: {
    fontSize: '0.65rem',
    fontWeight: '500',
  },
}
