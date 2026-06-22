import { useState } from 'react'
import { useIsAuthenticated } from '@azure/msal-react'
import { useAuth } from '../context/AuthContext'
import Login from '../pages/Login'
import MfaSetup from '../pages/MfaSetup'

export default function ProtectedRoute({ children }) {
  const { portalToken, handlePortalLogin, user } = useAuth()
  const isMsalAuthenticated = useIsAuthenticated()
  const [showMfaSetup, setShowMfaSetup] = useState(false)

  // Authenticated via portal login
  if (portalToken) {
    if (showMfaSetup) {
      return (
        <MfaSetup
          token={portalToken}
          onComplete={() => setShowMfaSetup(false)}
        />
      )
    }
    return children
  }

  // Authenticated via Entra SSO
  if (isMsalAuthenticated) return children

  // Not authenticated — show login
  return (
    <Login
      onLogin={(user, token) => {
        handlePortalLogin(user, token)
        if (!user.mfa_enabled) setShowMfaSetup(true)
      }}
    />
  )
}