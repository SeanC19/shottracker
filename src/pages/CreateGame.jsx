import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../supabase'

export default function CreateGame() {
  const { teamId } = useParams()
  const navigate = useNavigate()

  const [opponent, setOpponent] = useState('')
  const [location, setLocation] = useState('')
  const [gameDate, setGameDate] = useState(new Date().toISOString().split('T')[0])
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { data, error } = await supabase
      .from('games')
      .insert({
        team_id: teamId,
        opponent,
        location: location || null,
        game_date: gameDate,
      })
      .select()
      .single()

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      navigate(`/games/${data.id}`)
    }
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <button onClick={() => navigate(`/teams/${teamId}`)} style={styles.back}>← Back</button>
        <h1 style={styles.title}>New Game</h1>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.field}>
            <label style={styles.label}>Opponent</label>
            <input
              type="text"
              value={opponent}
              onChange={e => setOpponent(e.target.value)}
              style={styles.input}
              placeholder="Rival Hawks"
              required
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Date</label>
            <input
              type="date"
              value={gameDate}
              onChange={e => setGameDate(e.target.value)}
              style={styles.input}
              required
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Location (optional)</label>
            <input
              type="text"
              value={location}
              onChange={e => setLocation(e.target.value)}
              style={styles.input}
              placeholder="Home rink"
            />
          </div>

          {error && <p style={styles.error}>{error}</p>}

          <button type="submit" style={styles.button} disabled={loading}>
            {loading ? 'Starting...' : 'Start Game'}
          </button>
        </form>
      </div>
    </div>
  )
}

const styles = {
  container: {
    minHeight: '100vh', backgroundColor: '#f4f4f5',
    display: 'flex', alignItems: 'flex-start',
    justifyContent: 'center', padding: '2rem 1rem',
  },
  card: {
    backgroundColor: '#fff', padding: '2rem', borderRadius: '12px',
    boxShadow: '0 2px 16px rgba(0,0,0,0.08)', width: '100%', maxWidth: '420px',
  },
  back: {
    background: 'none', border: 'none', color: '#2563eb',
    cursor: 'pointer', fontSize: '0.875rem', padding: 0, marginBottom: '1rem',
  },
  title: { fontSize: '1.5rem', fontWeight: '700', margin: '0 0 1.5rem', color: '#111' },
  form: { display: 'flex', flexDirection: 'column', gap: '1rem' },
  field: { display: 'flex', flexDirection: 'column', gap: '0.35rem' },
  label: { fontSize: '0.875rem', fontWeight: '500', color: '#374151' },
  input: {
    padding: '0.625rem 0.75rem', borderRadius: '8px',
    border: '1px solid #d1d5db', fontSize: '1rem',
    outline: 'none', color: '#111', backgroundColor: '#fff',
  },
  error: { color: '#dc2626', fontSize: '0.875rem', margin: 0 },
  button: {
    padding: '0.75rem', backgroundColor: '#2563eb', color: '#fff',
    border: 'none', borderRadius: '8px', fontSize: '1rem',
    fontWeight: '600', cursor: 'pointer', marginTop: '0.5rem',
  },
}