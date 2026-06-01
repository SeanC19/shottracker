import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../supabase'

export default function GameSession() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [game, setGame] = useState(null)
  const [team, setTeam] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchGame()
  }, [id])

  async function fetchGame() {
    const { data: game } = await supabase
      .from('games')
      .select('*')
      .eq('id', id)
      .single()

    if (game) {
      setGame(game)
      const { data: team } = await supabase
        .from('teams')
        .select('*')
        .eq('id', game.team_id)
        .single()
      setTeam(team)
    }
    setLoading(false)
  }

  if (loading) return <div style={styles.loading}>Loading...</div>
  if (!game) return <div style={styles.loading}>Game not found.</div>

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <button onClick={() => navigate(`/teams/${game.team_id}`)} style={styles.back}>← Back</button>
        <div>
          <h1 style={styles.title}>{team?.name} vs {game.opponent}</h1>
          <p style={styles.subtitle}>
            {new Date(game.game_date).toLocaleDateString('en-US', {
              month: 'long', day: 'numeric', year: 'numeric'
            })}
            {game.location ? ` · ${game.location}` : ''}
          </p>
        </div>
      </div>

      <div style={styles.content}>
        <div style={styles.placeholder}>
          <p style={styles.placeholderText}>🏒 Shot logger coming next!</p>
          <p style={styles.placeholderSub}>Share link: <strong>/report/{game.share_token}</strong></p>
        </div>
      </div>
    </div>
  )
}

const styles = {
  container: { minHeight: '100vh', backgroundColor: '#f4f4f5' },
  loading: { padding: '2rem', color: '#71717a' },
  header: {
    backgroundColor: '#fff', padding: '1rem 1.5rem',
    borderBottom: '1px solid #e5e7eb', display: 'flex',
    alignItems: 'center', gap: '1rem',
  },
  back: {
    background: 'none', border: 'none', color: '#2563eb',
    cursor: 'pointer', fontSize: '0.875rem', padding: 0, flexShrink: 0,
  },
  title: { fontSize: '1.1rem', fontWeight: '700', margin: '0 0 0.15rem', color: '#111' },
  subtitle: { fontSize: '0.85rem', color: '#71717a', margin: 0 },
  content: { maxWidth: '600px', margin: '0 auto', padding: '1.5rem' },
  placeholder: {
    backgroundColor: '#fff', borderRadius: '12px', padding: '3rem',
    textAlign: 'center', border: '1px solid #e5e7eb',
  },
  placeholderText: { fontSize: '1.25rem', margin: '0 0 0.5rem', color: '#111' },
  placeholderSub: { fontSize: '0.875rem', color: '#71717a', margin: 0 },
}