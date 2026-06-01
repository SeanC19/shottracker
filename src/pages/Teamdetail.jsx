import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../supabase'

export default function TeamDetail() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [team, setTeam] = useState(null)
  const [players, setPlayers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)

  // New player form state
  const [playerName, setPlayerName] = useState('')
  const [jerseyNumber, setJerseyNumber] = useState('')
  const [position, setPosition] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchTeam()
    fetchPlayers()
  }, [id])

  async function fetchTeam() {
    const { data } = await supabase
      .from('teams')
      .select('*')
      .eq('id', id)
      .single()
    setTeam(data)
  }

  async function fetchPlayers() {
    const { data } = await supabase
      .from('players')
      .select('*')
      .eq('team_id', id)
      .eq('active', true)
      .order('jersey_number', { ascending: true })
    if (data) setPlayers(data)
    setLoading(false)
  }

  async function addPlayer(e) {
    e.preventDefault()
    setSaving(true)
    setError(null)

    const { data, error } = await supabase
      .from('players')
      .insert({
        team_id: id,
        name: playerName,
        jersey_number: jerseyNumber ? parseInt(jerseyNumber) : null,
        position: position || null,
      })
      .select()
      .single()

    if (error) {
      setError(error.message)
    } else {
      setPlayers(prev => [...prev, data].sort((a, b) => a.jersey_number - b.jersey_number))
      setPlayerName('')
      setJerseyNumber('')
      setPosition('')
      setShowForm(false)
    }
    setSaving(false)
  }

  async function removePlayer(playerId) {
    await supabase
      .from('players')
      .update({ active: false })
      .eq('id', playerId)
    setPlayers(prev => prev.filter(p => p.id !== playerId))
  }

  if (loading) return <div style={styles.loading}>Loading...</div>
  if (!team) return <div style={styles.loading}>Team not found.</div>

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <button onClick={() => navigate('/')} style={styles.back}>← Back</button>
        <div>
          <h1 style={styles.teamName}>{team.name}</h1>
          <span style={styles.joinCode}>Join code: {team.join_code}</span>
        </div>
      </div>

      <div style={styles.content}>
        <div style={styles.sectionHeader}>
          <h2 style={styles.sectionTitle}>Roster ({players.length})</h2>
          <button onClick={() => setShowForm(!showForm)} style={styles.addBtn}>
            {showForm ? 'Cancel' : '+ Add Player'}
          </button>
        </div>

        {showForm && (
          <form onSubmit={addPlayer} style={styles.form}>
            <div style={styles.formRow}>
              <input
                type="text"
                placeholder="Player name"
                value={playerName}
                onChange={e => setPlayerName(e.target.value)}
                style={styles.input}
                required
              />
              <input
                type="number"
                placeholder="#"
                value={jerseyNumber}
                onChange={e => setJerseyNumber(e.target.value)}
                style={{ ...styles.input, width: '70px' }}
              />
              <input
                type="text"
                placeholder="Position"
                value={position}
                onChange={e => setPosition(e.target.value)}
                style={{ ...styles.input, width: '100px' }}
              />
              <button type="submit" style={styles.saveBtn} disabled={saving}>
                {saving ? '...' : 'Add'}
              </button>
            </div>
            {error && <p style={styles.error}>{error}</p>}
          </form>
        )}

        {players.length === 0 && !showForm && (
          <p style={styles.empty}>No players yet. Add your roster above.</p>
        )}

        <div style={styles.playerList}>
          {players.map(player => (
            <div key={player.id} style={styles.playerRow}>
              <div style={styles.jersey}>
                {player.jersey_number ?? '—'}
              </div>
              <div style={styles.playerInfo}>
                <span style={styles.playerName}>{player.name}</span>
                {player.position && (
                  <span style={styles.position}>{player.position}</span>
                )}
              </div>
              <button
                onClick={() => removePlayer(player.id)}
                style={styles.removeBtn}
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#f4f4f5',
  },
  loading: {
    padding: '2rem',
    color: '#71717a',
  },
  header: {
    backgroundColor: '#fff',
    padding: '1rem 1.5rem',
    borderBottom: '1px solid #e5e7eb',
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
  },
  back: {
    background: 'none',
    border: 'none',
    color: '#2563eb',
    cursor: 'pointer',
    fontSize: '0.875rem',
    padding: 0,
    flexShrink: 0,
  },
  teamName: {
    fontSize: '1.25rem',
    fontWeight: '700',
    margin: '0 0 0.15rem',
    color: '#111',
  },
  joinCode: {
    fontSize: '0.8rem',
    color: '#2563eb',
    fontWeight: '600',
    backgroundColor: '#eff6ff',
    padding: '0.15rem 0.4rem',
    borderRadius: '5px',
  },
  content: {
    maxWidth: '600px',
    margin: '0 auto',
    padding: '1.5rem',
  },
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1rem',
  },
  sectionTitle: {
    fontSize: '1rem',
    fontWeight: '600',
    margin: 0,
    color: '#111',
  },
  addBtn: {
    padding: '0.45rem 0.9rem',
    backgroundColor: '#2563eb',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '0.875rem',
    fontWeight: '600',
    cursor: 'pointer',
  },
  form: {
    backgroundColor: '#fff',
    padding: '1rem',
    borderRadius: '10px',
    marginBottom: '1rem',
    border: '1px solid #e5e7eb',
  },
  formRow: {
    display: 'flex',
    gap: '0.5rem',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  input: {
    padding: '0.5rem 0.65rem',
    borderRadius: '7px',
    border: '1px solid #d1d5db',
    fontSize: '0.95rem',
    flex: 1,
    minWidth: '120px',
    outline: 'none',
  },
  saveBtn: {
    padding: '0.5rem 1rem',
    backgroundColor: '#16a34a',
    color: '#fff',
    border: 'none',
    borderRadius: '7px',
    fontWeight: '600',
    cursor: 'pointer',
    fontSize: '0.95rem',
  },
  error: {
    color: '#dc2626',
    fontSize: '0.875rem',
    margin: '0.5rem 0 0',
  },
  empty: {
    color: '#71717a',
    fontSize: '0.95rem',
    textAlign: 'center',
    padding: '2rem 0',
  },
  playerList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  playerRow: {
    backgroundColor: '#fff',
    borderRadius: '10px',
    padding: '0.75rem 1rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    border: '1px solid #e5e7eb',
  },
  jersey: {
    width: '36px',
    height: '36px',
    backgroundColor: '#eff6ff',
    color: '#2563eb',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '700',
    fontSize: '0.9rem',
    flexShrink: 0,
  },
  playerInfo: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '0.1rem',
  },
  playerName: {
    fontWeight: '500',
    fontSize: '0.95rem',
    color: '#111',
  },
  position: {
    fontSize: '0.8rem',
    color: '#71717a',
    textTransform: 'capitalize',
  },
  removeBtn: {
    background: 'none',
    border: 'none',
    color: '#ef4444',
    cursor: 'pointer',
    fontSize: '0.8rem',
    flexShrink: 0,
  },
}