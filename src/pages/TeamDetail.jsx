import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../supabase'

export default function TeamDetail() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [team, setTeam] = useState(null)
  const [players, setPlayers] = useState([])
  const [games, setGames] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [tab, setTab] = useState('games')

  const [playerName, setPlayerName] = useState('')
  const [jerseyNumber, setJerseyNumber] = useState('')
  const [position, setPosition] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  const [editingPlayerId, setEditingPlayerId] = useState(null)
  const [editName, setEditName] = useState('')
  const [editJersey, setEditJersey] = useState('')
  const [editPosition, setEditPosition] = useState('')

  useEffect(() => {
    fetchAll()
  }, [id])

  async function fetchAll() {
    const [teamRes, playersRes, gamesRes] = await Promise.all([
      supabase.from('teams').select('*').eq('id', id).single(),
      supabase.from('players').select('*').eq('team_id', id).eq('active', true).order('jersey_number'),
      supabase.from('games').select('*').eq('team_id', id).order('game_date', { ascending: false }),
    ])
    setTeam(teamRes.data)
    setPlayers(playersRes.data || [])
    setGames(gamesRes.data || [])
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
        jersey_number: jerseyNumber ? Number.parseInt(jerseyNumber) : null,
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
    await supabase.from('players').update({ active: false }).eq('id', playerId)
    setPlayers(prev => prev.filter(p => p.id !== playerId))
  }

  function startEditPlayer(player) {
    setEditingPlayerId(player.id)
    setEditName(player.name)
    setEditJersey(player.jersey_number ?? '')
    setEditPosition(player.position ?? '')
  }

  function cancelEditPlayer() {
    setEditingPlayerId(null)
  }

  async function saveEditPlayer(e, playerId) {
    e.preventDefault()
    const { data, error } = await supabase
      .from('players')
      .update({
        name: editName,
        jersey_number: editJersey ? Number.parseInt(editJersey) : null,
        position: editPosition || null,
      })
      .eq('id', playerId)
      .select()
      .single()

    if (!error) {
      setPlayers(prev =>
        prev.map(p => p.id === playerId ? data : p)
          .sort((a, b) => a.jersey_number - b.jersey_number)
      )
      setEditingPlayerId(null)
    }
  }

  if (loading) return <div style={styles.loading}>Loading...</div>
  if (!team) return <div style={styles.loading}>Team not found.</div>

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <button onClick={() => navigate('/')} style={styles.back}>← Back</button>
        <div style={styles.headerInfo}>
          <h1 style={styles.teamName}>{team.name}</h1>
        </div>
        <button onClick={() => navigate(`/teams/${id}/edit`)} style={styles.editBtn}>Edit</button>
      </div>

      <div style={styles.content}>
        {/* Tabs */}
        <div style={styles.tabs}>
          <button
            style={{ ...styles.tab, ...(tab === 'roster' ? styles.tabActive : {}) }}
            onClick={() => setTab('roster')}
          >
            Roster ({players.length})
          </button>
          <button
            style={{ ...styles.tab, ...(tab === 'games' ? styles.tabActive : {}) }}
            onClick={() => setTab('games')}
          >
            Games ({games.length})
          </button>
        </div>

        {/* Roster Tab */}
        {tab === 'roster' && (
          <>
            <div style={styles.sectionHeader}>
              <h2 style={styles.sectionTitle}>Players</h2>
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
                    style={{ ...styles.input, width: '70px', flex: 'none' }}
                  />
                  <input
                    type="text"
                    placeholder="Position"
                    value={position}
                    onChange={e => setPosition(e.target.value)}
                    style={{ ...styles.input, width: '100px', flex: 'none' }}
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
                editingPlayerId === player.id ? (
                  <form
                    key={player.id}
                    onSubmit={e => saveEditPlayer(e, player.id)}
                    style={styles.form}
                  >
                    <div style={styles.formRow}>
                      <input
                        type="text"
                        value={editName}
                        onChange={e => setEditName(e.target.value)}
                        style={styles.input}
                        required
                      />
                      <input
                        type="number"
                        placeholder="#"
                        value={editJersey}
                        onChange={e => setEditJersey(e.target.value)}
                        style={{ ...styles.input, width: '70px', flex: 'none' }}
                      />
                      <input
                        type="text"
                        placeholder="Position"
                        value={editPosition}
                        onChange={e => setEditPosition(e.target.value)}
                        style={{ ...styles.input, width: '100px', flex: 'none' }}
                      />
                      <button type="submit" style={styles.saveBtn}>Save</button>
                      <button type="button" onClick={cancelEditPlayer} style={styles.cancelEditBtn}>✕</button>
                    </div>
                  </form>
                ) : (
                  <div key={player.id} style={styles.playerRow}>
                    <div style={styles.jersey}>{player.jersey_number ?? '—'}</div>
                    <div style={styles.playerInfo}>
                      <span style={styles.playerNameText}>{player.name}</span>
                      {player.position && <span style={styles.position}>{player.position}</span>}
                    </div>
                    <button onClick={() => startEditPlayer(player)} style={styles.editRowBtn}>Edit</button>
                    <button onClick={() => removePlayer(player.id)} style={styles.removeBtn}>Remove</button>
                  </div>
                )
              ))}
            </div>
          </>
        )}

        {/* Games Tab */}
        {tab === 'games' && (
          <>
            <div style={styles.sectionHeader}>
              <h2 style={styles.sectionTitle}>Games</h2>
              <button onClick={() => navigate(`/teams/${id}/games/new`)} style={styles.addBtn}>
                + New Game
              </button>
            </div>

            {games.length === 0 && (
              <p style={styles.empty}>No games yet. Start your first game above.</p>
            )}

            <div style={styles.gameList}>
              {games.map(game => (
                <button
                  key={game.id}
                  style={styles.gameCard}
                  onClick={() => navigate(`/games/${game.id}`)}
                >
                  <div style={styles.gameInfo}>
                    <span style={styles.opponent}>vs {game.opponent}</span>
                    <span style={styles.gameDate}>
                      {new Date(game.game_date).toLocaleDateString('en-US', {
                        month: 'short', day: 'numeric', year: 'numeric'
                      })}
                    </span>
                    {game.location && <span style={styles.location}>{game.location}</span>}
                  </div>
                  {game.game_code && (
                    <span style={styles.gameCode}>{game.game_code}</span>
                  )}
                  <button
                    style={styles.editRowBtn}
                    onClick={e => { e.stopPropagation(); navigate(`/games/${game.id}/edit`) }}
                  >
                    Edit
                  </button>
                  <span style={styles.arrow}>→</span>
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

const styles = {
  container: { height: '100%', backgroundColor: '#f4f4f5', display: 'flex', flexDirection: 'column', overflow: 'hidden' },
  loading: { padding: '2rem', color: '#71717a' },
  header: {
    backgroundColor: '#fff', padding: '1rem 1.5rem',
    borderBottom: '1px solid #e5e7eb',
    display: 'flex', alignItems: 'center', gap: '1rem',
  },
  back: {
    background: 'none', border: 'none', color: '#2563eb',
    cursor: 'pointer', fontSize: '0.875rem', padding: 0, flexShrink: 0,
  },
  headerInfo: { flex: 1 },
  teamName: { fontSize: '1.25rem', fontWeight: '700', margin: '0 0 0.15rem', color: '#111' },
  editBtn: {
    background: 'none', border: '1px solid #d1d5db', color: '#374151',
    cursor: 'pointer', fontSize: '0.8rem', padding: '0.3rem 0.7rem',
    borderRadius: '6px', flexShrink: 0,
  },
  content: { padding: '1.5rem', flex: 1, overflowY: 'auto', minHeight: 0 },
  tabs: { display: 'flex', gap: '0.5rem', marginBottom: '1.25rem' },
  tab: {
    padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid #e5e7eb',
    backgroundColor: '#fff', color: '#71717a', cursor: 'pointer',
    fontSize: '0.875rem', fontWeight: '500',
  },
  tabActive: { backgroundColor: '#2563eb', color: '#fff', border: '1px solid #2563eb' },
  sectionHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' },
  sectionTitle: { fontSize: '1rem', fontWeight: '600', margin: 0, color: '#111' },
  addBtn: {
    padding: '0.45rem 0.9rem', backgroundColor: '#2563eb', color: '#fff',
    border: 'none', borderRadius: '8px', fontSize: '0.875rem', fontWeight: '600', cursor: 'pointer',
  },
  form: {
    backgroundColor: '#fff', padding: '1rem', borderRadius: '10px',
    marginBottom: '0.5rem', border: '1px solid #e5e7eb',
  },
  formRow: { display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' },
  input: {
    padding: '0.5rem 0.65rem', borderRadius: '7px', border: '1px solid #d1d5db',
    fontSize: '0.95rem', flex: 1, minWidth: '120px', outline: 'none', color: '#111', backgroundColor: '#fff',
  },
  saveBtn: {
    padding: '0.5rem 1rem', backgroundColor: '#16a34a', color: '#fff',
    border: 'none', borderRadius: '7px', fontWeight: '600', cursor: 'pointer', fontSize: '0.95rem',
  },
  cancelEditBtn: {
    padding: '0.5rem 0.65rem', backgroundColor: '#f4f4f5', color: '#374151',
    border: '1px solid #d1d5db', borderRadius: '7px', cursor: 'pointer', fontSize: '0.95rem',
  },
  error: { color: '#dc2626', fontSize: '0.875rem', margin: '0.5rem 0 0' },
  empty: { color: '#71717a', fontSize: '0.95rem', textAlign: 'center', padding: '2rem 0' },
  playerList: { display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '400px', overflowY: 'auto' },
  playerRow: {
    backgroundColor: '#fff', borderRadius: '10px', padding: '0.75rem 1rem',
    display: 'flex', alignItems: 'center', gap: '0.75rem', border: '1px solid #e5e7eb',
  },
  jersey: {
    width: '36px', height: '36px', backgroundColor: '#eff6ff', color: '#2563eb',
    borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontWeight: '700', fontSize: '0.9rem', flexShrink: 0,
  },
  playerInfo: { flex: 1, display: 'flex', flexDirection: 'column', gap: '0.1rem' },
  playerNameText: { fontWeight: '500', fontSize: '0.95rem', color: '#111' },
  position: { fontSize: '0.8rem', color: '#71717a', textTransform: 'capitalize' },
  editRowBtn: { background: 'none', border: 'none', color: '#2563eb', cursor: 'pointer', fontSize: '0.8rem' },
  removeBtn: { background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '0.8rem' },
  gameList: { display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '400px', overflowY: 'auto' },
  gameCard: {
    backgroundColor: '#fff', borderRadius: '10px', padding: '1rem',
    border: '1px solid #e5e7eb', cursor: 'pointer',
    display: 'flex', alignItems: 'center', gap: '0.75rem',
  },
  gameInfo: { flex: 1, display: 'flex', flexDirection: 'column', gap: '0.2rem' },
  opponent: { fontWeight: '600', fontSize: '0.95rem', color: '#111' },
  gameDate: { fontSize: '0.8rem', color: '#71717a' },
  location: { fontSize: '0.8rem', color: '#71717a' },
  gameCode: {
    fontSize: '0.7rem', fontWeight: '700', color: '#2563eb',
    backgroundColor: '#eff6ff', padding: '0.15rem 0.4rem',
    borderRadius: '5px', letterSpacing: '0.05em', flexShrink: 0,
  },
  arrow: { color: '#d1d5db', fontSize: '1rem' },
}
