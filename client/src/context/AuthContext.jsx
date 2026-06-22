import { createContext, useContext } from 'react'
import { useMsal, useIsAuthenticated } from '@azure/msal-react'
import { loginRequest } from '../utils/authConfig'

const AuthContext = createContext(null)

const DEV_USER = {
  id: null,
  email: null,
  name: null,
  role: 'SeniorDeveloper',
  isDev: true,
  isSeniorDev: true
}

export function AuthProvider({ children }) {
  const { instance, accounts } = useMsal()
  const isAuthenticated = useIsAuthenticated()
  const msalUser = accounts[0] || null

  async function login() {
    await instance.loginRedirect(loginRequest)
  }

  async function logout() {
    await instance.logoutRedirect()
  }

  async function getToken() {
    if (!msalUser) return null
    try {
      const response = await instance.acquireTokenSilent({
        ...loginRequest,
        account: msalUser
      })
      return response.accessToken
    } catch {
      await instance.acquireTokenRedirect(loginRequest)
    }
  }

  const user = isAuthenticated && msalUser ? {
    id: msalUser.localAccountId,
    email: msalUser.username,
    name: msalUser.name,
    role: msalUser.idTokenClaims?.roles?.[0] || 'Developer',
    isDev: true,
    isSeniorDev: msalUser.idTokenClaims?.roles?.includes('SeniorDeveloper') || false
  } : DEV_USER

  return (
    <AuthContext.Provider value={{ user, login, logout, getToken, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}