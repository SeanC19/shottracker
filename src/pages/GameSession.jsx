import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../supabase'
import rinkImg from '../assets/rink.png'

const RESULTS = ['Goal', 'On Target', 'Missed', 'Blocked']
const SHOT_TYPES = ['Wrist', 'Slap', 'Snap', 'Backhand', 'Tip', 'Deflection']

const RESULT_COLORS = {
  'Goal': '#16a34a',
  'On Target': '#2563eb',
  'Missed': '#71717a',
  'Blocked': '#dc2626',
}

export default function GameSession() {
  const { id } = useParams()
  const navigate = useNavigate()
  const rinkRef = useRef(null)

  const [game, setGame] = useState(null)
  const [team, setTeam] = useState(null)
  const [players, setPlayers] = useState([])
  const [shots, setShots] = useState([])
  const [loading, setLoading] = useState(true)

  // Shot entry state
  const [pendingShot, setPendingShot] = useState(null) // {x_pct, y_pct}
  const [selectedPlayer, setSelectedPlayer] = useState(null)
  const [selectedResult, setSelectedResult] = useState('On Target')
  const [selectedType, setSelectedType] = useState('Wrist')
  const [saving, setSaving] = useState(false)
  const [showTypeSelector, setShowTypeSelector] = useState(false)

  useEffect(() => {
    fetchAll()
  }, [id])

  async function fetchAll() {
    const { data: game } = await supabase.from('games').select('*').eq('id', id).single()
    if (!game) { setLoading(false); return }
    setGame(game)

    const [teamRes, playersRes, shotsRes] = await Promise.all([
      supabase.from('teams').select('*').eq('id', game.team_id).single(),
      supabase.from('players').select('*').eq('team_id', game.team_id).eq('active', true).order('jersey_number'),
      supabase.from('shots').select('*, players(name, jersey_number)').eq('game_id', id),
    ])

    setTeam(teamRes.data)
    setPlayers(playersRes.data || [])
    setShots(shotsRes.data || [])
    setLoading(false)
  }

  function handleRinkTap(e) {
    const rect = rinkRef.current.getBoundingClientRect()
    const x = e.clientX ?? e.touches?.[0]?.clientX
    const y = e.clientY ?? e.touches?.[0]?.clientY
    if (x === undefined) return
    const x_pct = (x - rect.left) / rect.width
    const y_pct = (y - rect.top) / rect.height
    setPendingShot({ x_pct, y_pct })
    setSelectedPlayer(null)
    setSelectedResult('On Target')
    setSelectedType('Wrist')
    setShowTypeSelector(false)
  }

  async function saveShot() {
    if (!pendingShot || !selectedPlayer) return
    setSaving(true)

    const { data, error } = await supabase
      .from('shots')
      .insert({
        game_id: id,
        player_id: selectedPlayer.id,
        x_pct: pendingShot.x_pct,
        y_pct: pendingShot.y_pct,
        shot_type: selectedType.toLowerCase(),
        result: selectedResult.toLowerCase().replace(' ', '_'),
      })
      .select('*, players(name, jersey_number)')
      .single()

    if (!error) {
      setShots(prev => [...prev, data])
      setPendingShot(null)
      setSelectedPlayer(null)
    }
    setSaving(false)
  }

  function cancelShot() {
    setPendingShot(null)
    setSelectedPlayer(null)
  }

  function getResultColor(result) {
    const map = {
      goal: '#16a34a',
      on_target: '#2563eb',
      missed: '#71717a',
      blocked: '#dc2626',
    }
    return map[result] || '#71717a'
  }

  if (loading) return <div style={s.loading}>Loading...</div>
  if (!game) return <div style={s.loading}>Game not found.</div>

  const goalCount = shots.filter(sh => sh.result === 'goal').length
  const onTargetCount = shots.filter(sh => sh.result === 'on_target').length

  return (
    <div style={s.page}>
      {/* Header */}
      <div style={s.header}>
        <button onClick={() => navigate(`/teams/${game.team_id}`)} style={s.back}>←</button>
        <div style={s.headerInfo}>
          <span style={s.matchup}>{team?.name} vs {game.opponent}</span>
          <span style={s.stats}>{shots.length} shots · {goalCount} goals · {onTargetCount} on target</span>
        </div>
        <button
          onClick={() => navigate(`/report/${game.share_token}`)}
          style={s.reportBtn}
        >
          Report
        </button>
      </div>

      {/* Tap instruction */}
      {!pendingShot && (
        <div style={s.instruction}>Tap the rink to log a shot</div>
      )}

      {/* Rink */}
      <div style={s.rinkWrap}>
        <div
          ref={rinkRef}
          style={s.rink}
          onClick={handleRinkTap}
          onTouchStart={handleRinkTap}
        >
          <img src={rinkImg} alt="hockey rink" style={{ width: "100%", display: "block" }} draggable={false} />

          {/* Logged shots */}
          {shots.map(shot => (
            <div
              key={shot.id}
              style={{
                ...s.dot,
                left: `${shot.x_pct * 100}%`,
                top: `${shot.y_pct * 100}%`,
                backgroundColor: getResultColor(shot.result),
                border: shot.result === 'goal' ? '2px solid #fff' : '1.5px solid rgba(255,255,255,0.5)',
                width: shot.result === 'goal' ? '14px' : '10px',
                height: shot.result === 'goal' ? '14px' : '10px',
              }}
              title={`${shot.players?.name} – ${shot.result}`}
            />
          ))}

          {/* Pending shot marker */}
          {pendingShot && (
            <div style={{
              ...s.dot,
              left: `${pendingShot.x_pct * 100}%`,
              top: `${pendingShot.y_pct * 100}%`,
              backgroundColor: '#f59e0b',
              width: '14px',
              height: '14px',
              border: '2px solid #fff',
              animation: 'pulse 1s infinite',
            }} />
          )}
        </div>
      </div>

      {/* Legend */}
      <div style={s.legend}>
        {Object.entries(RESULT_COLORS).map(([label, color]) => (
          <span key={label} style={s.legendItem}>
            <span style={{ ...s.legendDot, backgroundColor: color }} />
            {label}
          </span>
        ))}
      </div>

      {/* Bottom sheet */}
      {pendingShot && (
        <div style={s.sheet}>
          {/* Shot type row */}
          <div style={s.typeRow}>
            <span style={s.typeLabel}>Shot type:</span>
            {SHOT_TYPES.map(t => (
              <button
                key={t}
                style={{ ...s.typeBtn, ...(selectedType === t ? s.typeBtnActive : {}) }}
                onClick={() => setSelectedType(t)}
              >
                {t}
              </button>
            ))}
          </div>

          {/* Result row */}
          <div style={s.resultRow}>
            {RESULTS.map(r => (
              <button
                key={r}
                style={{
                  ...s.resultBtn,
                  backgroundColor: selectedResult === r ? RESULT_COLORS[r] : '#f4f4f5',
                  color: selectedResult === r ? '#fff' : '#374151',
                }}
                onClick={() => setSelectedResult(r)}
              >
                {r}
              </button>
            ))}
          </div>

          {/* Player grid */}
          <div style={s.playerGrid}>
            {players.map(p => (
              <button
                key={p.id}
                style={{
                  ...s.playerBtn,
                  backgroundColor: selectedPlayer?.id === p.id ? '#2563eb' : '#f4f4f5',
                  color: selectedPlayer?.id === p.id ? '#fff' : '#111',
                }}
                onClick={() => setSelectedPlayer(p)}
              >
                <span style={s.playerNum}>#{p.jersey_number ?? '—'}</span>
                <span style={s.playerNameBtn}>{p.name.split(' ')[0]}</span>
              </button>
            ))}
          </div>

          {/* Actions */}
          <div style={s.actions}>
            <button onClick={cancelShot} style={s.cancelBtn}>Cancel</button>
            <button
              onClick={saveShot}
              style={{
                ...s.saveBtn,
                opacity: !selectedPlayer ? 0.5 : 1,
              }}
              disabled={!selectedPlayer || saving}
            >
              {saving ? 'Saving...' : 'Log Shot'}
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes pulse {
          0%, 100% { transform: translate(-50%, -50%) scale(1); }
          50% { transform: translate(-50%, -50%) scale(1.3); }
        }
      `}</style>
    </div>
  )
}

const s = {
  page: { minHeight: '100vh', backgroundColor: '#111', display: 'flex', flexDirection: 'column' },
  loading: { padding: '2rem', color: '#71717a' },
  header: {
    backgroundColor: '#1a1a1a', padding: '0.75rem 1rem',
    display: 'flex', alignItems: 'center', gap: '0.75rem',
    borderBottom: '1px solid #333',
  },
  back: {
    background: 'none', border: 'none', color: '#fff',
    fontSize: '1.25rem', cursor: 'pointer', flexShrink: 0, padding: '0 0.25rem',
  },
  headerInfo: { flex: 1, display: 'flex', flexDirection: 'column', gap: '0.1rem' },
  matchup: { fontSize: '0.9rem', fontWeight: '600', color: '#fff' },
  stats: { fontSize: '0.75rem', color: '#888' },
  reportBtn: {
    padding: '0.35rem 0.75rem', backgroundColor: '#2563eb', color: '#fff',
    border: 'none', borderRadius: '6px', fontSize: '0.8rem',
    fontWeight: '600', cursor: 'pointer', flexShrink: 0,
  },
  instruction: {
    textAlign: 'center', color: '#888', fontSize: '0.8rem',
    padding: '0.4rem', backgroundColor: '#1a1a1a',
  },
  rinkWrap: {
    flex: 1, padding: '0.75rem', display: 'flex',
    alignItems: 'center', justifyContent: 'center',
  },
  rink: {
    position: 'relative', width: '100%', maxWidth: '560px',
    cursor: 'crosshair', userSelect: 'none', borderRadius: '12px',
    boxShadow: '0 0 0 2px #333',
  },
  dot: {
    position: 'absolute', borderRadius: '50%',
    transform: 'translate(-50%, -50%)',
    pointerEvents: 'none',
  },
  legend: {
    display: 'flex', gap: '0.75rem', justifyContent: 'center',
    padding: '0.4rem', flexWrap: 'wrap',
  },
  legendItem: { display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.72rem', color: '#aaa' },
  legendDot: { width: '8px', height: '8px', borderRadius: '50%', flexShrink: 0 },
  sheet: {
    backgroundColor: '#1a1a1a', borderTop: '1px solid #333',
    padding: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.6rem',
  },
  typeRow: { display: 'flex', gap: '0.35rem', alignItems: 'center', flexWrap: 'wrap' },
  typeLabel: { fontSize: '0.75rem', color: '#888', flexShrink: 0 },
  typeBtn: {
    padding: '0.25rem 0.6rem', borderRadius: '6px', border: '1px solid #333',
    backgroundColor: '#2a2a2a', color: '#aaa', fontSize: '0.75rem', cursor: 'pointer',
  },
  typeBtnActive: { backgroundColor: '#374151', color: '#fff', border: '1px solid #555' },
  resultRow: { display: 'flex', gap: '0.4rem' },
  resultBtn: {
    flex: 1, padding: '0.5rem 0.25rem', borderRadius: '8px',
    border: 'none', fontSize: '0.78rem', fontWeight: '600', cursor: 'pointer',
  },
  playerGrid: {
    display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))', gap: '0.4rem',
  },
  playerBtn: {
    padding: '0.5rem 0.25rem', borderRadius: '8px', border: 'none',
    cursor: 'pointer', display: 'flex', flexDirection: 'column',
    alignItems: 'center', gap: '0.1rem',
  },
  playerNum: { fontSize: '0.7rem', fontWeight: '700' },
  playerNameBtn: { fontSize: '0.75rem' },
  actions: { display: 'flex', gap: '0.5rem' },
  cancelBtn: {
    flex: 1, padding: '0.65rem', borderRadius: '8px',
    border: '1px solid #333', backgroundColor: '#2a2a2a',
    color: '#aaa', fontSize: '0.9rem', cursor: 'pointer',
  },
  saveBtn: {
    flex: 2, padding: '0.65rem', borderRadius: '8px',
    border: 'none', backgroundColor: '#2563eb',
    color: '#fff', fontSize: '0.9rem', fontWeight: '700', cursor: 'pointer',
  },
}