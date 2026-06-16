import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { PublicClientApplication } from '@azure/msal-browser'
import { MsalProvider } from '@azure/msal-react'
import { msalConfig } from './utils/authConfig'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'

const msalInstance = new PublicClientApplication(msalConfig)

function Dashboard() {
  return (
    <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-blue-400">TIPINC Dev Portal</h1>
        <p className="mt-2 text-gray-400">Kanban board coming soon</p>
        <span className="mt-4 inline-block bg-blue-900 text-blue-300 text-xs px-3 py-1 rounded-full">
          v0.1.00 — Auth Ready
        </span>
      </div>
    </div>
  )
}

function NotFound() {
  return (
    <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
      <h1 className="text-2xl text-gray-400">404 — Page not found</h1>
    </div>
  )
}

function App() {
  return (
    <MsalProvider instance={msalInstance}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </MsalProvider>
  )
}

export default App