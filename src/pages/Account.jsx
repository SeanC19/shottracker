import { useEffect, useState } from 'react'
import { supabase } from '../supabase'

export default function Account() {
  const [profile, setProfile] = useState(null)
  const [email, setEmail] = useState('')

  useEffect(() => {
    fetchProfile()
  }, [])

  async function fetchProfile() {
    const { data: { user } } = await supabase.auth.getUser()
    setEmail(user?.email || '')

    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()
    setProfile(data)
  }

  async function handleSignOut() {
    await supabase.auth.signOut()
  }

  return (
    <div style={s.page}>
      <div style={s.header}>
        <h1 style={s.title}>Account</h1>
      </div>

      <div style={s.content}>
        <div style={s.card}>
          <div style={s.avatar}>
            {(profile?.display_name || email || '?')[0].toUpperCase()}
          </div>
          <div style={s.info}>
            {profile?.display_name && (
              <span style={s.name}>{profile.display_name}</span>
            )}
            <span style={s.email}>{email}</span>
          </div>
        </div>

        <div style={s.section}>
          <button onClick={handleSignOut} style={s.signOutBtn}>
            Sign Out
          </button>
        </div>

        <p style={s.version}>ShotMap · v0.1</p>
      </div>
    </div>
  )
}

const s = {
  page: { minHeight: '100vh', backgroundColor: '#f4f4f5', paddingBottom: '80px' },
  header: {
    backgroundColor: '#fff', padding: '1rem 1.5rem',
    borderBottom: '1px solid #e5e7eb',
  },
  title: { fontSize: '1.25rem', fontWeight: '700', margin: 0, color: '#111' },
  content: { maxWidth: '500px', margin: '0 auto', padding: '1.5rem' },
  card: {
    backgroundColor: '#fff', borderRadius: '12px', padding: '1.25rem',
    display: 'flex', alignItems: 'center', gap: '1rem',
    border: '1px solid #e5e7eb', marginBottom: '1.25rem',
  },
  avatar: {
    width: '48px', height: '48px', borderRadius: '50%',
    backgroundColor: '#2563eb', color: '#fff',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '1.25rem', fontWeight: '700', flexShrink: 0,
  },
  info: { display: 'flex', flexDirection: 'column', gap: '0.15rem' },
  name: { fontWeight: '600', fontSize: '1rem', color: '#111' },
  email: { fontSize: '0.875rem', color: '#71717a' },
  section: { marginBottom: '1.25rem' },
  signOutBtn: {
    width: '100%', padding: '0.75rem', backgroundColor: '#fff',
    color: '#dc2626', border: '1px solid #fca5a5', borderRadius: '10px',
    fontSize: '0.95rem', fontWeight: '600', cursor: 'pointer',
  },
  version: { textAlign: 'center', color: '#d1d5db', fontSize: '0.78rem', marginTop: '2rem' },
}