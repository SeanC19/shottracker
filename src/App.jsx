import { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { supabase } from './supabase'
import TabBar from './components/TabBar.jsx'
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
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  if (session === undefined) return null

  const auth = (el) => session ? el : <Navigate to="/login" />
  const guest = (el) => session ? <Navigate to="/" /> : el

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
      <TabBar />
    </BrowserRouter>
  )
}