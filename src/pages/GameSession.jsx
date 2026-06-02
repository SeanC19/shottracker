import { useEffect, useRef, useState } from 'react'
import { getUserPlan } from '../utils/plan'
import { useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../supabase'
import rinkImg from '../assets/rink.png'

const RESULTS = ['Goal', 'On Target', 'Missed', 'Blocked']
const SHOT_TYPES = ['Wrist', 'Slap', 'Snap', 'Backhand', 'Tip']

const RESULT_COLORS = {
  'Goal': '#16a34a',
  'On Target': '#2563eb',
  'Missed': '#71717a',
  'Blocked': '#dc2626',
}

const RESULT_COLOR_MAP = {
  goal: '#16a34a',
  on_target: '#2563eb',
  missed: '#71717a',
  blocked: '#dc2626',
}

function getResultColor(result) {
  return RESULT_COLOR_MAP[result] || '#71717a'
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
  const [pendingShot, setPendingShot] = useState(null)
  const [selectedPlayer, setSelectedPlayer] = useState(null)
  const [selectedResult, setSelectedResult] = useState('On Target')
  const [selectedType, setSelectedType] = useState('Wrist')
  const [saving, setSaving] = useState(false)
  const [codeCopied, setCodeCopied] = useState(false)
  const [isPro, setIsPro] = useState(false)

  useEffect(() => {
    fetchAll()
    getUserPlan().then(plan => setIsPro(plan === 'pro'))
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
    const x_pct = (e.clientX - rect.left) / rect.width
    const y_pct = (e.clientY - rect.top) / rect.height
    setPendingShot({ x_pct, y_pct })
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
    }
    setSaving(false)
  }

  async function undoLastShot() {
    setPendingShot(null)
    if (shots.length === 0) return
    const lastShot = shots.reduce((latest, sh) =>
      new Date(sh.created_at) > new Date(latest.created_at) ? sh : latest
    , shots[0])
    await supabase.from('shots').delete().eq('id', lastShot.id)
    setShots(prev => prev.filter(sh => sh.id !== lastShot.id))
  }

  if (loading) return <div style={s.loading}>Loading...</div>
  if (!game) return <div style={s.loading}>Game not found.</div>

  const goalCount = shots.filter(sh => sh.result === 'goal').length
  const onTargetCount = shots.filter(sh => sh.result === 'on_target').length
  const missedCount = shots.filter(sh => sh.result === 'missed').length
  const blockedCount = shots.filter(sh => sh.result === 'blocked').length

  const proCodeLabel = codeCopied ? '✓ Copied' : game.game_code
  const codeLabel = isPro ? proCodeLabel : '🔒 Code'

  return (
    <div style={s.page}>
      {/* Header */}
      <div style={s.header}>
        <button onClick={() => navigate(`/teams/${game.team_id}`)} style={s.back}>←</button>
        <div style={s.headerInfo}>
          <span style={s.matchup}>{team?.name} vs {game.opponent}</span>
        </div>
        {game.game_code && (
          <button
            style={{ ...s.joinCodeChip, ...(isPro ? {} : s.locked) }}
            onClick={() => {
              if (!isPro) { navigate('/upgrade'); return }
              navigator.clipboard.writeText(game.game_code)
              setCodeCopied(true)
              setTimeout(() => setCodeCopied(false), 2000)
            }}
          >
            {codeLabel}
          </button>
        )}
        <button
          onClick={() => isPro ? navigate(`/report/${game.share_token}`) : navigate('/upgrade')}
          style={{ ...s.reportBtn, ...(!isPro && s.locked) }}
        >
          {isPro ? 'Report' : '🔒 Report'}
        </button>
      </div>

      {/* Rink */}
      <div style={s.rinkWrap}>
        <div
          ref={rinkRef}
          style={s.rink}
          role="button"
          tabIndex={0}
          onClick={handleRinkTap}
          onKeyDown={e => e.key === 'Enter' && handleRinkTap(e)}
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

      {/* Stats */}
      <div style={s.statsBar}>
        <span style={s.statItem}><span style={s.statNum}>{shots.length}</span> shots</span>
        <span style={s.statItem}><span style={{ ...s.statNum, color: '#16a34a' }}>{goalCount}</span> goals</span>
        <span style={s.statItem}><span style={{ ...s.statNum, color: '#2563eb' }}>{onTargetCount}</span> on target</span>
        <span style={s.statItem}><span style={{ ...s.statNum, color: '#9ca3af' }}>{missedCount}</span> missed</span>
        <span style={s.statItem}><span style={{ ...s.statNum, color: '#dc2626' }}>{blockedCount}</span> blocked</span>
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

      {/* Bottom sheet — always visible */}
      <div style={s.sheet}>
        {!pendingShot && (
          <div style={s.noShotPrompt}>Tap the rink above to place a shot</div>
        )}

        {/* Shot type row */}
        <div style={s.playerGrid}>
          {SHOT_TYPES.map(t => (
            <button
              key={t}
              style={{
                ...s.playerBtn,
                backgroundColor: selectedType === t ? '#2563eb' : '#f4f4f5',
                color: selectedType === t ? '#fff' : '#111',
              }}
              onClick={() => setSelectedType(prev => prev === t ? null : t)}
            >
              <span style={s.playerNameBtn}>{t}</span>
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
              onClick={() => setSelectedResult(prev => prev === r ? null : r)}
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
              onClick={() => setSelectedPlayer(prev => prev?.id === p.id ? null : p)}
            >
              <span style={s.playerNum}>#{p.jersey_number ?? '—'}</span>
              <span style={s.playerNameBtn}>{p.name.split(' ')[0]}</span>
            </button>
          ))}
        </div>

        {/* Actions — always visible */}
        <div style={s.actions}>
          <button onClick={undoLastShot} style={{ ...s.cancelBtn, opacity: (!pendingShot && shots.length === 0) ? 0.4 : 1 }} disabled={!pendingShot && shots.length === 0}>Undo</button>
          <button
            onClick={saveShot}
            style={{ ...s.saveBtn, opacity: (!pendingShot || !selectedPlayer) ? 0.5 : 1 }}
            disabled={!pendingShot || !selectedPlayer || saving}
          >
            {saving ? 'Saving...' : 'Log Shot'}
          </button>
        </div>
      </div>

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
  page: { height: '100svh', backgroundColor: '#111', display: 'flex', flexDirection: 'column', overflow: 'hidden' },
  loading: { padding: '2rem', color: '#71717a' },
  locked: { opacity: 0.6, cursor: 'pointer' },
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
  joinCodeChip: {
    padding: '0.25rem 0.5rem', backgroundColor: '#2a2a2a', color: '#f59e0b',
    border: '1px solid #444', borderRadius: '6px', fontSize: '0.75rem',
    fontWeight: '700', letterSpacing: '0.05em', cursor: 'pointer', flexShrink: 0,
  },
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
    boxShadow: '0 0 0 2px #333', touchAction: 'manipulation',
  },
  dot: {
    position: 'absolute', borderRadius: '50%',
    transform: 'translate(-50%, -50%)',
    pointerEvents: 'none',
  },
  statsBar: {
    display: 'flex', justifyContent: 'center', gap: '1.5rem',
    padding: '0.4rem 1rem', backgroundColor: '#1a1a1a',
  },
  statItem: { fontSize: '0.78rem', color: '#888' },
  statNum: { fontWeight: '700', color: '#fff', marginRight: '0.2rem' },
  legend: {
    display: 'flex', gap: '0.75rem', justifyContent: 'center',
    padding: '0.4rem', paddingBottom: 'calc(0.4rem + env(safe-area-inset-bottom, 0px))',
    flexWrap: 'wrap',
  },
  legendItem: { display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.72rem', color: '#aaa' },
  legendDot: { width: '8px', height: '8px', borderRadius: '50%', flexShrink: 0 },
  sheet: {
    backgroundColor: '#1a1a1a', borderTop: '1px solid #333',
    padding: '0.75rem', paddingBottom: 'calc(0.75rem + env(safe-area-inset-bottom, 0px))',
    display: 'flex', flexDirection: 'column', gap: '0.6rem',
  },
  noShotPrompt: { textAlign: 'center', color: '#555', fontSize: '0.78rem', padding: '0.25rem 0' },
  resultRow: { display: 'flex', gap: '0.4rem', justifyContent: 'center', flexWrap: 'wrap' },
  resultBtn: {
    flex: 1, minWidth: '70px', padding: '0.5rem 0.25rem', borderRadius: '8px',
    border: 'none', fontSize: '0.78rem', fontWeight: '600', cursor: 'pointer',
  },
  playerGrid: {
    display: 'flex', flexWrap: 'wrap', gap: '0.4rem', justifyContent: 'center',
  },
  playerBtn: {
    width: '80px', padding: '0.5rem 0.25rem', borderRadius: '8px', border: 'none',
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