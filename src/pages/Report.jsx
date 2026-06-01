import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../supabase'
import rinkImg from '../assets/rink.png'

const RESULT_COLORS = {
  goal: '#16a34a',
  on_target: '#2563eb',
  missed: '#9ca3af',
  blocked: '#dc2626',
}

const RESULT_LABELS = {
  goal: 'Goal',
  on_target: 'On Target',
  missed: 'Missed',
  blocked: 'Blocked',
}

export default function Report() {
  const { token } = useParams()
  const navigate = useNavigate()
  const [game, setGame] = useState(null)
  const [team, setTeam] = useState(null)
  const [shots, setShots] = useState([])
  const [players, setPlayers] = useState([])
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    fetchReport()
  }, [token])

  async function fetchReport() {
    const { data: game } = await supabase
      .from('games')
      .select('*')
      .eq('share_token', token)
      .single()

    if (!game) { setLoading(false); return }
    setGame(game)

    const [teamRes, shotsRes, playersRes] = await Promise.all([
      supabase.from('teams').select('*').eq('id', game.team_id).single(),
      supabase.from('shots').select('*, players(id, name, jersey_number)').eq('game_id', game.id),
      supabase.from('players').select('*').eq('team_id', game.team_id).eq('active', true).order('jersey_number'),
    ])

    setTeam(teamRes.data)
    setShots(shotsRes.data || [])
    setPlayers(playersRes.data || [])
    setLoading(false)
  }

  function copyLink() {
    navigator.clipboard.writeText(window.location.href)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function getPlayerStats(playerId) {
    const playerShots = shots.filter(s => s.players?.id === playerId)
    const goals = playerShots.filter(s => s.result === 'goal').length
    const onTarget = playerShots.filter(s => s.result === 'on_target').length
    const total = playerShots.length
    const shootingPct = total > 0 ? Math.round((goals / total) * 100) : 0
    return { total, goals, onTarget, shootingPct, shots: playerShots }
  }

  if (loading) return (
    <div style={s.loadingPage}>
      <div style={s.loadingText}>Loading report...</div>
    </div>
  )

  if (!game) return (
    <div style={s.loadingPage}>
      <div style={s.loadingText}>Report not found.</div>
    </div>
  )

  const totalGoals = shots.filter(s => s.result === 'goal').length
  const totalOnTarget = shots.filter(s => s.result === 'on_target').length
  const shootingPct = shots.length > 0 ? Math.round((totalGoals / shots.length) * 100) : 0

  const activePlayers = players.filter(p => getPlayerStats(p.id).total > 0)
    .sort((a, b) => getPlayerStats(b.id).total - getPlayerStats(a.id).total)

  return (
    <div style={s.page}>
      {/* Header */}
      <div style={s.header}>
        <div style={s.headerTop}>
          <div style={s.headerLeft}>
            <button onClick={() => navigate(-1)} style={s.backBtn}>←</button>
            <span style={s.appName}>ShotTracker</span>
          </div>
          <button onClick={copyLink} style={s.shareBtn}>
            {copied ? '✓ Copied!' : 'Share Link'}
          </button>
        </div>
        <h1 style={s.matchup}>{team?.name} vs {game.opponent}</h1>
        <p style={s.gameMeta}>
          {new Date(game.game_date).toLocaleDateString('en-US', {
            weekday: 'long', month: 'long', day: 'numeric', year: 'numeric'
          })}
          {game.location ? ` · ${game.location}` : ''}
        </p>
      </div>

      {/* Summary stats */}
      <div style={s.summaryRow}>
        <div style={s.statCard}>
          <span style={s.statNum}>{shots.length}</span>
          <span style={s.statLabel}>Total Shots</span>
        </div>
        <div style={s.statCard}>
          <span style={{ ...s.statNum, color: '#16a34a' }}>{totalGoals}</span>
          <span style={s.statLabel}>Goals</span>
        </div>
        <div style={s.statCard}>
          <span style={{ ...s.statNum, color: '#2563eb' }}>{totalOnTarget}</span>
          <span style={s.statLabel}>On Target</span>
        </div>
        <div style={s.statCard}>
          <span style={s.statNum}>{shootingPct}%</span>
          <span style={s.statLabel}>Shooting %</span>
        </div>
      </div>

      {/* Shot map */}
      <div style={s.section}>
        <h2 style={s.sectionTitle}>Shot Map</h2>
        <div style={s.rinkWrap}>
          <div style={s.rinkContainer}>
            <img src={rinkImg} alt="hockey rink" style={{ width: "100%", display: "block" }} draggable={false} />
            {shots.map(shot => (
              <div
                key={shot.id}
                style={{
                  ...s.dot,
                  left: `${shot.x_pct * 100}%`,
                  top: `${shot.y_pct * 100}%`,
                  backgroundColor: RESULT_COLORS[shot.result] || '#9ca3af',
                  width: shot.result === 'goal' ? '14px' : '10px',
                  height: shot.result === 'goal' ? '14px' : '10px',
                  border: shot.result === 'goal' ? '2px solid #fff' : '1.5px solid rgba(255,255,255,0.6)',
                  zIndex: shot.result === 'goal' ? 2 : 1,
                }}
              />
            ))}
          </div>
        </div>

        {/* Legend */}
        <div style={s.legend}>
          {Object.entries(RESULT_LABELS).map(([key, label]) => (
            <span key={key} style={s.legendItem}>
              <span style={{ ...s.legendDot, backgroundColor: RESULT_COLORS[key] }} />
              {label}
            </span>
          ))}
        </div>
      </div>

      {/* Player breakdown */}
      {activePlayers.length > 0 && (
        <div style={s.section}>
          <h2 style={s.sectionTitle}>Player Breakdown</h2>
          <div style={s.playerCards}>
            {activePlayers.map(player => {
              const stats = getPlayerStats(player.id)
              return (
                <div key={player.id} style={s.playerCard}>
                  <div style={s.playerHeader}>
                    <div style={s.jerseyBadge}>#{player.jersey_number ?? '—'}</div>
                    <div style={s.playerMeta}>
                      <span style={s.playerName}>{player.name}</span>
                      {player.position && <span style={s.playerPos}>{player.position}</span>}
                    </div>
                  </div>

                  <div style={s.playerStats}>
                    <div style={s.playerStat}>
                      <span style={s.playerStatNum}>{stats.total}</span>
                      <span style={s.playerStatLabel}>Shots</span>
                    </div>
                    <div style={s.playerStat}>
                      <span style={{ ...s.playerStatNum, color: '#16a34a' }}>{stats.goals}</span>
                      <span style={s.playerStatLabel}>Goals</span>
                    </div>
                    <div style={s.playerStat}>
                      <span style={{ ...s.playerStatNum, color: '#2563eb' }}>{stats.onTarget}</span>
                      <span style={s.playerStatLabel}>On Net</span>
                    </div>
                    <div style={s.playerStat}>
                      <span style={s.playerStatNum}>{stats.shootingPct}%</span>
                      <span style={s.playerStatLabel}>Sh%</span>
                    </div>
                  </div>

                  {/* Mini shot map per player */}
                  <div style={s.miniRinkWrap}>
                    <div style={s.miniRink}>
                      <img src={rinkImg} alt="hockey rink" style={{ width: "100%", display: "block" }} draggable={false} />
                      {stats.shots.map(shot => (
                        <div
                          key={shot.id}
                          style={{
                            ...s.dot,
                            left: `${shot.x_pct * 100}%`,
                            top: `${shot.y_pct * 100}%`,
                            backgroundColor: RESULT_COLORS[shot.result] || '#9ca3af',
                            width: shot.result === 'goal' ? '10px' : '7px',
                            height: shot.result === 'goal' ? '10px' : '7px',
                            border: '1px solid rgba(255,255,255,0.7)',
                          }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {shots.length === 0 && (
        <div style={s.empty}>No shots logged for this game yet.</div>
      )}

      <div style={s.footer}>
        <span style={s.footerText}>Powered by ShotTracker</span>
      </div>
    </div>
  )
}

const s = {
  page: { minHeight: '100vh', backgroundColor: '#f4f4f5', paddingBottom: '2rem' },
  loadingPage: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  loadingText: { color: '#71717a', fontSize: '1rem' },
  header: { backgroundColor: '#111', color: '#fff', padding: '1.25rem 1.5rem' },
  headerTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' },
  headerLeft: { display: 'flex', alignItems: 'center', gap: '0.75rem' },
  backBtn: {
    background: 'none', border: 'none', color: '#fff',
    fontSize: '1.25rem', cursor: 'pointer', padding: '0 0.25rem',
  },
  appName: { fontSize: '0.8rem', fontWeight: '700', color: '#888', letterSpacing: '0.05em', textTransform: 'uppercase' },
  shareBtn: {
    padding: '0.4rem 0.9rem', backgroundColor: '#2563eb', color: '#fff',
    border: 'none', borderRadius: '7px', fontSize: '0.8rem', fontWeight: '600', cursor: 'pointer',
  },
  matchup: { fontSize: '1.4rem', fontWeight: '700', margin: '0 0 0.3rem', color: '#fff' },
  gameMeta: { fontSize: '0.85rem', color: '#888', margin: 0 },
  summaryRow: {
    display: 'flex', gap: '0.75rem', padding: '1rem 1.25rem',
    backgroundColor: '#fff', borderBottom: '1px solid #e5e7eb',
  },
  statCard: {
    flex: 1, display: 'flex', flexDirection: 'column',
    alignItems: 'center', gap: '0.2rem',
  },
  statNum: { fontSize: '1.5rem', fontWeight: '700', color: '#111' },
  statLabel: { fontSize: '0.7rem', color: '#71717a', textAlign: 'center' },
  section: { padding: '1.25rem', maxWidth: '700px', margin: '0 auto' },
  sectionTitle: { fontSize: '1rem', fontWeight: '700', color: '#111', margin: '0 0 0.75rem' },
  rinkWrap: { backgroundColor: '#fff', borderRadius: '12px', padding: '1rem', border: '1px solid #e5e7eb' },
  rinkContainer: { position: 'relative', width: '100%' },
  dot: {
    position: 'absolute', borderRadius: '50%',
    transform: 'translate(-50%, -50%)', pointerEvents: 'none',
  },
  legend: {
    display: 'flex', gap: '1rem', justifyContent: 'center',
    flexWrap: 'wrap', marginTop: '0.75rem',
  },
  legendItem: { display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.78rem', color: '#555' },
  legendDot: { width: '9px', height: '9px', borderRadius: '50%', flexShrink: 0 },
  playerCards: { display: 'flex', flexDirection: 'column', gap: '0.75rem' },
  playerCard: {
    backgroundColor: '#fff', borderRadius: '12px', padding: '1rem',
    border: '1px solid #e5e7eb',
  },
  playerHeader: { display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' },
  jerseyBadge: {
    width: '40px', height: '40px', backgroundColor: '#eff6ff', color: '#2563eb',
    borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontWeight: '700', fontSize: '0.9rem', flexShrink: 0,
  },
  playerMeta: { display: 'flex', flexDirection: 'column', gap: '0.1rem' },
  playerName: { fontWeight: '600', fontSize: '1rem', color: '#111' },
  playerPos: { fontSize: '0.78rem', color: '#71717a', textTransform: 'capitalize' },
  playerStats: { display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' },
  playerStat: {
    flex: 1, backgroundColor: '#f9fafb', borderRadius: '8px',
    padding: '0.5rem', display: 'flex', flexDirection: 'column',
    alignItems: 'center', gap: '0.15rem',
  },
  playerStatNum: { fontSize: '1.1rem', fontWeight: '700', color: '#111' },
  playerStatLabel: { fontSize: '0.65rem', color: '#71717a' },
  miniRinkWrap: { borderRadius: '8px', overflow: 'hidden', border: '1px solid #e5e7eb' },
  miniRink: { position: 'relative', width: '100%' },
  empty: { textAlign: 'center', color: '#71717a', padding: '3rem 1rem' },
  footer: { textAlign: 'center', padding: '1.5rem', marginTop: '1rem' },
  footerText: { fontSize: '0.78rem', color: '#aaa' },
}