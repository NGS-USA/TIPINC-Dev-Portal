import { createContext, useContext, useState, useEffect } from 'react'
import { useMsal, useIsAuthenticated } from '@azure/msal-react'
import { loginRequest } from '../utils/authConfig'

const AuthContext = createContext(null)

const API = import.meta.env.VITE_API_URL || 'http://localhost:4000'

export function AuthProvider({ children }) {
  const { instance, accounts } = useMsal()
  const isMsalAuthenticated = useIsAuthenticated()
  const msalUser = accounts[0] || null

  const [portalUser, setPortalUser] = useState(() => {
    try {
      const stored = localStorage.getItem('portal_user')
      return stored ? JSON.parse(stored) : null
    } catch { return null }
  })
  const [portalToken, setPortalToken] = useState(() => localStorage.getItem('portal_token') || null)

  const isAuthenticated = isMsalAuthenticated || !!portalToken

  function handlePortalLogin(user, token) {
    setPortalUser(user)
    setPortalToken(token)
    localStorage.setItem('portal_user', JSON.stringify(user))
    localStorage.setItem('portal_token', token)
  }

  function handlePortalLogout() {
    setPortalUser(null)
    setPortalToken(null)
    localStorage.removeItem('portal_user')
    localStorage.removeItem('portal_token')
  }

  async function login() {
    await instance.loginRedirect(loginRequest)
  }

  async function logout() {
    if (portalToken) {
      try {
        await fetch(`${API}/api/auth/logout`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${portalToken}` }
        })
      } catch {}
      handlePortalLogout()
    } else {
      await instance.logoutRedirect()
    }
  }

  async function getToken() {
    if (portalToken) return portalToken
    if (!msalUser) return null
    try {
      const response = await instance.acquireTokenSilent({ ...loginRequest, account: msalUser })
      return response.accessToken
    } catch {
      await instance.acquireTokenRedirect(loginRequest)
    }
  }

  const user = portalUser || (isMsalAuthenticated && msalUser ? {
    id: msalUser.localAccountId,
    email: msalUser.username,
    name: msalUser.name,
    role: msalUser.idTokenClaims?.roles?.[0] || 'Developer',
    isDev: true,
    isSeniorDev: msalUser.idTokenClaims?.roles?.includes('SeniorDeveloper') || false
  } : import.meta.env.DEV ? {
    id: null, email: null, name: null,
    role: 'SeniorDeveloper', isDev: true, isSeniorDev: true
  } : null)

  const isSeniorDev = user?.role === 'SeniorDeveloper'
  const isDev = user?.role === 'Developer' || isSeniorDev

  return (
    <AuthContext.Provider value={{
      user, isAuthenticated, login, logout, getToken,
      portalToken, handlePortalLogin, handlePortalLogout,
      isSeniorDev, isDev
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}