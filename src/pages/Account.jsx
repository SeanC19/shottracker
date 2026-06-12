import { useEffect, useState } from 'react'
import { supabase } from '../supabase'

const CATEGORIES = ['General', 'Bug Report', 'Feature Request']

async function handleSignOut() {
  await supabase.auth.signOut()
}

export default function Account() {
  const [profile, setProfile] = useState(null)
  const [email, setEmail] = useState('')
  const [userId, setUserId] = useState(null)

  const [rating, setRating] = useState(null)
  const [category, setCategory] = useState('General')
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [feedbackError, setFeedbackError] = useState(null)

  useEffect(() => {
    fetchProfile()
  }, [])

  async function fetchProfile() {
    const { data: { user } } = await supabase.auth.getUser()
    setEmail(user?.email || '')
    setUserId(user?.id || null)

    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()
    setProfile(data)
  }

  async function handleFeedback(e) {
    e.preventDefault()
    setSubmitting(true)
    setFeedbackError(null)

    const { error } = await supabase.from('feedback').insert({
      user_id: userId,
      rating,
      category,
      message,
    })

    if (error) {
      setFeedbackError('Something went wrong. Please try again.')
    } else {
      setSubmitted(true)
      setRating(null)
      setCategory('General')
      setMessage('')
    }
    setSubmitting(false)
  }

  return (
    <div style={s.page}>
      <div style={s.header}>
        <h1 style={s.title}>Account</h1>
      </div>

      <div style={s.content}>
        {/* Profile card */}
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

        {/* Feedback form */}
        <div style={s.feedbackCard}>
          <h2 style={s.feedbackTitle}>Share Feedback</h2>

          {submitted && (
            <div style={s.successBox}>
              <p style={s.successText}>Thanks for your feedback!</p>
              <button style={s.resetBtn} onClick={() => setSubmitted(false)}>Submit another</button>
            </div>
          )}
          {!submitted && (
            <form onSubmit={handleFeedback} style={s.form}>
              {/* Rating */}
              <div style={s.fieldGroup}>
                <label htmlFor="rating" style={s.label}>Rating</label>
                <div id="rating" style={s.stars}>
                  {[1, 2, 3, 4, 5].map(n => {
                    let starColor = '#d1d5db'
                    if (rating >= n) starColor = '#f59e0b'
                    return (
                      <button
                        key={n}
                        type="button"
                        style={{ ...s.star, color: starColor }}
                        onClick={() => {
                          setRating(prev => {
                            if (prev === n) return null
                            return n
                          })
                        }}
                      >
                        ★
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Category */}
              <div style={s.fieldGroup}>
                <label htmlFor="category" style={s.label}>Category</label>
                <div id="category" style={s.categoryRow}>
                  {CATEGORIES.map(c => {
                    let btnBg = '#f4f4f5'
                    let btnColor = '#374151'
                    if (category === c) {
                      btnBg = '#2563eb'
                      btnColor = '#fff'
                    }
                    return (
                      <button
                        key={c}
                        type="button"
                        style={{
                          ...s.categoryBtn,
                          backgroundColor: btnBg,
                          color: btnColor,
                        }}
                        onClick={() => setCategory(c)}
                      >
                        {c}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Message */}
              <div style={s.fieldGroup}>
                <label htmlFor="message" style={s.label}>Message</label>
                <textarea
                  id="message"
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  style={s.textarea}
                  placeholder="Tell us what you think..."
                  rows={4}
                  required
                />
              </div>

              {feedbackError && <p style={s.error}>{feedbackError}</p>}

              <button type="submit" style={s.submitBtn} disabled={submitting}>
                {submitting && 'Sending...'}
                {!submitting && 'Send Feedback'}
              </button>
            </form>
          )}
        </div>

        {/* Sign out */}
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
  feedbackCard: {
    backgroundColor: '#fff', borderRadius: '12px', padding: '1.25rem',
    border: '1px solid #e5e7eb', marginBottom: '1.25rem',
  },
  feedbackTitle: { fontSize: '1rem', fontWeight: '600', color: '#111', margin: '0 0 1rem' },
  form: { display: 'flex', flexDirection: 'column', gap: '1rem' },
  fieldGroup: { display: 'flex', flexDirection: 'column', gap: '0.4rem' },
  label: { fontSize: '0.875rem', fontWeight: '500', color: '#374151' },
  stars: { display: 'flex', gap: '0.25rem' },
  star: {
    background: 'none', border: 'none', fontSize: '1.75rem',
    cursor: 'pointer', padding: '0 0.1rem', lineHeight: 1,
  },
  categoryRow: { display: 'flex', gap: '0.5rem', flexWrap: 'wrap' },
  categoryBtn: {
    padding: '0.35rem 0.75rem', borderRadius: '8px', border: 'none',
    fontSize: '0.8rem', fontWeight: '500', cursor: 'pointer',
  },
  textarea: {
    padding: '0.625rem 0.75rem', borderRadius: '8px', border: '1px solid #d1d5db',
    fontSize: '0.95rem', outline: 'none', resize: 'vertical',
    color: '#111', backgroundColor: '#fff', fontFamily: 'inherit',
  },
  error: { color: '#dc2626', fontSize: '0.875rem', margin: 0 },
  submitBtn: {
    padding: '0.75rem', backgroundColor: '#2563eb', color: '#fff',
    border: 'none', borderRadius: '8px', fontSize: '1rem',
    fontWeight: '600', cursor: 'pointer',
  },
  successBox: { textAlign: 'center', padding: '1rem 0' },
  successText: { color: '#16a34a', fontWeight: '600', fontSize: '1rem', marginBottom: '0.75rem' },
  resetBtn: {
    background: 'none', border: 'none', color: '#2563eb',
    cursor: 'pointer', fontSize: '0.875rem',
  },
  section: { marginBottom: '1.25rem' },
  signOutBtn: {
    width: '100%', padding: '0.75rem', backgroundColor: '#fff',
    color: '#dc2626', border: '1px solid #fca5a5', borderRadius: '10px',
    fontSize: '0.95rem', fontWeight: '600', cursor: 'pointer',
  },
  version: { textAlign: 'center', color: '#d1d5db', fontSize: '0.78rem', marginTop: '2rem' },
}
