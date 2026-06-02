import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabase'
import { getUserPlan } from '../utils/plan'

export default function Dashboard() {
  const [teams, setTeams] = useState([])
  const [loading, setLoading] = useState(true)
  const [isPro, setIsPro] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    fetchTeams()
    getUserPlan().then(plan => setIsPro(plan === 'pro'))
  }, [])

  async function fetchTeams() {
    const { data: { user } } = await supabase.auth.getUser()

    const { data, error } = await supabase
      .from('teams')
      .select('*')
      .eq('owner_id', user.id)
      .order('created_at', { ascending: false })

    if (!error) setTeams(data)
    setLoading(false)
  }

  async function handleSignOut() {
    await supabase.auth.signOut()
  }

  async function removeTeam(e, teamId) {
    e.stopPropagation()
    await supabase.from('teams').delete().eq('id', teamId)
    setTeams(prev => prev.filter(t => t.id !== teamId))
  }

  const sportEmoji = {
    hockey: '🏒',
    soccer: '⚽',
    lacrosse: '🥍',
    basketball: '🏀',
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>ShotMap</h1>
        <button onClick={handleSignOut} style={styles.signOutBtn}>Sign out</button>
      </div>

      <div style={styles.content}>
        <div style={styles.joinBanner}>
          <span style={styles.joinText}>Have a game code?</span>
          <button onClick={() => navigate('/join')} style={styles.joinBtn}>
            Join a Game
          </button>
        </div>

        <div style={styles.sectionHeader}>
          <h2 style={styles.sectionTitle}>Your Teams</h2>
          <button onClick={() => navigate('/teams/new')} style={styles.newBtn}>
            {!isPro && teams.length >= 1 ? '🔒 New Team' : '+ New Team'}
          </button>
        </div>

        {loading && <p style={styles.muted}>Loading...</p>}

        {!loading && teams.length === 0 && (
          <div style={styles.empty}>
            <p style={styles.emptyText}>No teams yet.</p>
            <button onClick={() => navigate('/teams/new')} style={styles.newBtn}>
              Create your first team
            </button>
          </div>
        )}

        <div style={styles.grid}>
          {teams.map(team => (
            <div
              key={team.id}
              style={styles.card}
              onClick={() => navigate(`/teams/${team.id}`)}
            >
              <div style={styles.cardTop}>
                <span style={styles.emoji}>{sportEmoji[team.sport] || '🏒'}</span>
              </div>
              <h3 style={styles.teamName}>{team.name}</h3>
              <div style={styles.cardBottom}>
                <p style={styles.sport}>{team.sport}</p>
                <div style={styles.cardActions}>
                  <button onClick={e => { e.stopPropagation(); navigate(`/teams/${team.id}/edit`) }} style={styles.editBtn}>Edit</button>
                  <button onClick={e => removeTeam(e, team.id)} style={styles.removeBtn}>Remove</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

const styles = {
  container: {
    height: '100%',
    backgroundColor: '#f4f4f5',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  header: {
    backgroundColor: '#fff',
    padding: '1rem 1.5rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid #e5e7eb',
  },
  title: {
    fontSize: '1.25rem',
    fontWeight: '700',
    margin: 0,
    color: '#111',
  },
  signOutBtn: {
    background: 'none',
    border: 'none',
    color: '#71717a',
    cursor: 'pointer',
    fontSize: '0.875rem',
  },
  content: {
    padding: '1.5rem',
    flex: 1,
    overflowY: 'auto',
    minHeight: 0,
  },
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1rem',
  },
  sectionTitle: {
    fontSize: '1.1rem',
    fontWeight: '600',
    margin: 0,
    color: '#111',
  },
  newBtn: {
    padding: '0.5rem 1rem',
    backgroundColor: '#2563eb',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '0.875rem',
    fontWeight: '600',
    cursor: 'pointer',
  },
  muted: {
    color: '#71717a',
    fontSize: '0.95rem',
  },
  empty: {
    textAlign: 'center',
    padding: '3rem 1rem',
  },
  emptyText: {
    color: '#71717a',
    marginBottom: '1rem',
  },
  joinBanner: {
    backgroundColor: '#eff6ff',
    border: '1px solid #bfdbfe',
    borderRadius: '10px',
    padding: '0.75rem 1rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1.25rem',
  },
  joinText: { fontSize: '0.875rem', color: '#1d4ed8', fontWeight: '500' },
  joinBtn: {
    padding: '0.4rem 0.9rem', backgroundColor: '#2563eb', color: '#fff',
    border: 'none', borderRadius: '7px', fontSize: '0.875rem',
    fontWeight: '600', cursor: 'pointer',
  },
  grid: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
    maxHeight: '400px',
    overflowY: 'auto',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: '12px',
    padding: '1.25rem',
    cursor: 'pointer',
    boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
    border: '1px solid #e5e7eb',
  },
  cardTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '0.5rem',
  },
  emoji: {
    fontSize: '1.5rem',
  },
  teamName: {
    fontSize: '1.1rem',
    fontWeight: '600',
    margin: '0 0 0.2rem',
    color: '#111',
  },
  cardBottom: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sport: {
    fontSize: '0.875rem',
    color: '#71717a',
    margin: 0,
    textTransform: 'capitalize',
  },
  cardActions: { display: 'flex', gap: '0.75rem', alignItems: 'center' },
  editBtn: { background: 'none', border: 'none', color: '#2563eb', cursor: 'pointer', fontSize: '0.8rem', padding: 0 },
  removeBtn: { background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '0.8rem', padding: 0 },
}