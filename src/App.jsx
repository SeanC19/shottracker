import { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { supabase } from './supabase'
import { getAnonId, setAnonId, clearAnonId } from './utils/anonId'
import TabBar from './components/TabBar.jsx'
import SaveAccountBanner from './components/SaveAccountBanner.jsx'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Dashboard from './pages/Dashboard'
import CreateTeam from './pages/CreateTeam'
import TeamDetail from './pages/TeamDetail'
import CreateGame from './pages/CreateGame'
import EditTeam from './pages/EditTeam'
import EditGame from './pages/EditGame'
import GameSession from './pages/GameSession'
import JoinGame from './pages/JoinGame'
import Report from './pages/Report'
import Account from './pages/Account.jsx'

export default function App() {
  const [session, setSession] = useState(undefined)

  useEffect(() => {
    async function initSession() {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        setSession(session)
      } else {
        const { data } = await supabase.auth.signInAnonymously()
        setAnonId(data.session.user.id)
        setSession(data.session)
      }
    }
    initSession()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session)
      const becameAuthenticated = (event === 'SIGNED_IN' || event === 'USER_UPDATED')
        && session
        && !session.user.is_anonymous
      if (becameAuthenticated) {
        const anonId = getAnonId()
        if (anonId) {
          await supabase.rpc('claim_anonymous_data', { anon_id: anonId })
          clearAnonId()
        }
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  if (session === undefined) return null

  const isAnonymous = session?.user?.is_anonymous ?? false

  function auth(el) {
    if (session) return el
    return <Navigate to="/login" />
  }

  // Anonymous users can visit login/signup to upgrade their account
  function guest(el) {
    if (session && !isAnonymous) return <Navigate to="/" />
    return el
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={guest(<Login />)} />
        <Route path="/signup" element={guest(<Signup />)} />
        <Route path="/" element={auth(<Dashboard />)} />
        <Route path="/teams/new" element={auth(<CreateTeam />)} />
        <Route path="/teams/:id" element={auth(<TeamDetail />)} />
        <Route path="/teams/:id/edit" element={auth(<EditTeam />)} />
        <Route path="/teams/:teamId/games/new" element={auth(<CreateGame />)} />
        <Route path="/games/:id/edit" element={auth(<EditGame />)} />
        <Route path="/games/:id" element={auth(<GameSession />)} />
        <Route path="/join" element={auth(<JoinGame />)} />
        <Route path="/report/:token" element={<Report />} />
        <Route path="/account" element={auth(<Account />)} />
      </Routes>
      {isAnonymous && <SaveAccountBanner />}
      <TabBar />
    </BrowserRouter>
  )
}