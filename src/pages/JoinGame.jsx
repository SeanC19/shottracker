import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabase'

export default function JoinGame() {
  const [code, setCode] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  async function handleJoin(e) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { data: game, error: gameError } = await supabase
      .from('games')
      .select('*')
      .ilike('game_code', code.trim())
      .single()

    if (gameError || !game) {
      setError('No game found with that code. Check the code and try again.')
      setLoading(false)
      return
    }

    navigate(`/games/${game.id}`)
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>Join a Game</h1>
        <p style={styles.subtitle}>Enter the team's join code to start tracking shots.</p>

        <form onSubmit={handleJoin} style={styles.form}>
          <input
            type="text"
            value={code}
            onChange={e => setCode(e.target.value)}
            style={styles.input}
            placeholder="HAWKS42"
            maxLength={10}
            required
          />

          {error && <p style={styles.error}>{error}</p>}

          <button type="submit" style={styles.button} disabled={loading}>
            {loading ? 'Finding game...' : 'Join Game'}
          </button>
        </form>

        <button onClick={() => navigate('/')} style={styles.back}>← Back to dashboard</button>
      </div>
    </div>
  )
}

const styles = {
  container: {
    minHeight: '100vh', backgroundColor: '#f4f4f5',
    display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem',
  },
  card: {
    backgroundColor: '#fff', padding: '2rem', borderRadius: '12px',
    boxShadow: '0 2px 16px rgba(0,0,0,0.08)', width: '100%', maxWidth: '380px',
  },
  title: { fontSize: '1.5rem', fontWeight: '700', margin: '0 0 0.35rem', color: '#111' },
  subtitle: { color: '#71717a', fontSize: '0.9rem', margin: '0 0 1.5rem' },
  form: { display: 'flex', flexDirection: 'column', gap: '0.75rem' },
  input: {
    padding: '0.75rem', borderRadius: '8px', border: '1px solid #d1d5db',
    fontSize: '1.25rem', fontWeight: '700', letterSpacing: '0.1em',
    textAlign: 'center', outline: 'none', color: '#111',
    textTransform: 'uppercase', backgroundColor: '#fff',
  },
  error: { color: '#dc2626', fontSize: '0.875rem', margin: 0 },
  button: {
    padding: '0.75rem', backgroundColor: '#2563eb', color: '#fff',
    border: 'none', borderRadius: '8px', fontSize: '1rem',
    fontWeight: '600', cursor: 'pointer',
  },
  back: {
    display: 'block', marginTop: '1.25rem', background: 'none',
    border: 'none', color: '#2563eb', cursor: 'pointer',
    fontSize: '0.875rem', textAlign: 'center', width: '100%',
  },
}