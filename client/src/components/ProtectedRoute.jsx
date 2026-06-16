import { useIsAuthenticated } from '@azure/msal-react'
import Login from '../pages/Login'

export default function ProtectedRoute({ children }) {
  const isAuthenticated = useIsAuthenticated()
  return isAuthenticated ? children : <Login />
}