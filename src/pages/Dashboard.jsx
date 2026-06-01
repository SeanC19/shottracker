import { supabase } from '../supabase'

export default function Dashboard() {
  async function handleSignOut() {
    await supabase.auth.signOut()
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>You're in! 🏒</h1>
        <p style={styles.subtitle}>Auth is working. Next up: teams and rosters.</p>
        <button onClick={handleSignOut} style={styles.button}>
          Sign out
        </button>
      </div>
    </div>
  )
}

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f4f4f5',
  },
  card: {
    backgroundColor: '#fff',
    padding: '2.5rem',
    borderRadius: '12px',
    boxShadow: '0 2px 16px rgba(0,0,0,0.08)',
    width: '100%',
    maxWidth: '400px',
    textAlign: 'center',
  },
  title: {
    fontSize: '1.75rem',
    fontWeight: '700',
    margin: '0 0 0.5rem',
    color: '#111',
  },
  subtitle: {
    color: '#71717a',
    margin: '0 0 1.5rem',
    fontSize: '0.95rem',
  },
  button: {
    padding: '0.75rem 1.5rem',
    backgroundColor: '#ef4444',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
  },
}