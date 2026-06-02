import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabase'
import { generateJoinCode } from '../utils/joinCode'

const SPORTS = ['hockey', 'soccer', 'lacrosse', 'basketball']

export default function CreateTeam() {
  const [name, setName] = useState('')
  const [sport, setSport] = useState('hockey')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const [blocked, setBlocked] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    async function checkLimit() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user?.is_anonymous) return
      const { count } = await supabase
        .from('teams')
        .select('id', { count: 'exact', head: true })
        .eq('owner_id', user.id)
      if (count >= 1) setBlocked(true)
    }
    checkLimit()
  }, [])

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { data: { user } } = await supabase.auth.getUser()
    const join_code = generateJoinCode(name)

    const { data, error } = await supabase
      .from('teams')
      .insert({ name, sport, join_code, owner_id: user.id })
      .select()
      .single()

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      await supabase.from('players').insert({
        team_id: data.id,
        name: 'Guest',
        jersey_number: 1,
      })
      navigate(`/teams/${data.id}`)
    }
  }

  if (blocked) return (
    <div style={styles.container}>
      <div style={styles.card}>
        <button onClick={() => navigate('/')} style={styles.back}>← Back</button>
        <h1 style={styles.title}>Multiple Teams</h1>
        <p style={styles.wallText}>
          Create a free account to manage more than one team and keep your data safe across devices.
        </p>
        <button onClick={() => navigate('/signup')} style={styles.button}>Create Account</button>
        <button onClick={() => navigate('/login')} style={styles.secondaryBtn}>Sign in to existing account</button>
      </div>
    </div>
  )

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <button onClick={() => navigate('/')} style={styles.back}>← Back</button>
        <h1 style={styles.title}>Create a Team</h1>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.field}>
            <label style={styles.label}>Team name</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              style={styles.input}
              placeholder="Mighty Ducks"
              required
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Sport</label>
            <select
              value={sport}
              onChange={e => setSport(e.target.value)}
              style={styles.input}
            >
              {SPORTS.map(s => (
                <option key={s} value={s}>
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {error && <p style={styles.error}>{error}</p>}

          <button type="submit" style={styles.button} disabled={loading}>
            {loading ? 'Creating...' : 'Create Team'}
          </button>
        </form>
      </div>
    </div>
  )
}

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#f4f4f5',
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'center',
    padding: '2rem 1rem',
  },
  card: {
    backgroundColor: '#fff',
    padding: '2rem',
    borderRadius: '12px',
    boxShadow: '0 2px 16px rgba(0,0,0,0.08)',
    width: '100%',
    maxWidth: '420px',
  },
  back: {
    background: 'none',
    border: 'none',
    color: '#2563eb',
    cursor: 'pointer',
    fontSize: '0.875rem',
    padding: 0,
    marginBottom: '1rem',
  },
  title: {
    fontSize: '1.5rem',
    fontWeight: '700',
    margin: '0 0 1.5rem',
    color: '#111',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.35rem',
  },
  label: {
    fontSize: '0.875rem',
    fontWeight: '500',
    color: '#374151',
  },
  input: {
    padding: '0.625rem 0.75rem',
    borderRadius: '8px',
    border: '1px solid #d1d5db',
    fontSize: '1rem',
    outline: 'none',
    backgroundColor: '#fff',
    color: '#111',
  },
  wallText: { color: '#374151', fontSize: '0.95rem', margin: '0 0 1.5rem', lineHeight: '1.5' },
  secondaryBtn: {
    display: 'block', width: '100%', padding: '0.75rem', marginTop: '0.75rem',
    backgroundColor: '#fff', color: '#374151', border: '1px solid #d1d5db',
    borderRadius: '8px', fontSize: '1rem', cursor: 'pointer',
  },
  error: {
    color: '#dc2626',
    fontSize: '0.875rem',
    margin: 0,
  },
  button: {
    padding: '0.75rem',
    backgroundColor: '#2563eb',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
    marginTop: '0.5rem',
  },
}