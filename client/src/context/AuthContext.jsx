import { createContext, useContext } from 'react'
import { useMsal } from '@azure/msal-react'
import { loginRequest } from '../utils/authConfig'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const { instance, accounts } = useMsal()
  const user = accounts[0] || null

  async function login() {
    await instance.loginRedirect(loginRequest)
  }

  async function logout() {
    await instance.logoutRedirect()
  }

  async function getToken() {
    if (!user) return null
    try {
      const response = await instance.acquireTokenSilent({
        ...loginRequest,
        account: user
      })
      return response.accessToken
    } catch {
      await instance.acquireTokenRedirect(loginRequest)
    }
  }

  const roles = user?.idTokenClaims?.roles || []
  const isSeniorDev = roles.includes('SeniorDeveloper')
  const isDev = roles.includes('Developer') || isSeniorDev

  return (
    <AuthContext.Provider value={{ user, login, logout, getToken, roles, isDev, isSeniorDev }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}