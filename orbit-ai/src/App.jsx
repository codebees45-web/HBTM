import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AppProvider } from './context/AppContext.jsx'
import Landing from './pages/Landing.jsx'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import Auth from './pages/Auth.jsx'
import Onboarding from './pages/Onboarding.jsx'
import DashboardLayout from './layouts/DashboardLayout.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Roadmap from './pages/Roadmap.jsx'
import Assessment from './pages/Assessment.jsx'
import Mentor from './pages/Mentor.jsx'
import Notifications from './pages/Notifications.jsx'
import Analytics from './pages/Analytics.jsx'
import Profile from './pages/Profile.jsx'
import Settings from './pages/Settings.jsx'
import PhonePairing from './pages/PhonePairing.jsx'
import GrowthPlan from './pages/GrowthPlan.jsx'
import FocusMode from './pages/FocusMode.jsx'
import Journal from './pages/Journal.jsx'
import KnowledgeVault from './pages/KnowledgeVault.jsx'

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />

          {/* Auth Routes */}
          <Route path="/auth" element={<Auth />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Onboarding & Pairing */}
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/pair/:sessionId" element={<PhonePairing />} />
          
          {/* Deep Work Nexus (Full screen outside DashboardLayout) */}
          <Route path="/focus" element={<FocusMode />} />

          {/* Protected/Dashboard Routes */}
          <Route path="/dashboard" element={<DashboardLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="roadmap" element={<Roadmap />} />
            <Route path="growth-plan" element={<GrowthPlan />} />
            <Route path="assessment" element={<Assessment />} />
            <Route path="mentor" element={<Mentor />} />
            <Route path="notifications" element={<Notifications />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="journal" element={<Journal />} />
            <Route path="vault" element={<KnowledgeVault />} />
            <Route path="profile" element={<Profile />} />
            <Route path="settings" element={<Settings />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AppProvider>
  )
}