import { useState } from 'react'

const API = import.meta.env.VITE_API_URL || 'http://localhost:4000'

export default function Login({ onLogin }) {
  const [step, setStep] = useState('login') // 'login' | 'mfa' | 'change-password'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [mfaCode, setMfaCode] = useState('')
  const [mfaToken, setMfaToken] = useState(null)
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [sessionToken, setSessionToken] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  async function handleLogin(e) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const res = await fetch(`${API}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Login failed')

      if (data.mfaRequired) {
        setMfaToken(data.mfaToken)
        setStep('mfa')
        return
      }

      localStorage.setItem('portal_token', data.token)
      localStorage.setItem('portal_user', JSON.stringify(data.user))

      if (data.mustChangePassword) {
        setSessionToken(data.token)
        setStep('change-password')
        return
      }

      if (onLogin) onLogin(data.user, data.token)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleMfa(e) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const res = await fetch(`${API}/api/auth/verify-mfa`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mfaToken, code: mfaCode })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Verification failed')

      localStorage.setItem('portal_token', data.token)
      localStorage.setItem('portal_user', JSON.stringify(data.user))

      if (data.mustChangePassword) {
        setSessionToken(data.token)
        setStep('change-password')
        return
      }

      if (onLogin) onLogin(data.user, data.token)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleChangePassword(e) {
    e.preventDefault()
    setError(null)
    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match')
      return
    }
    setLoading(true)
    try {
      const res = await fetch(`${API}/api/auth/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionToken}`
        },
        body: JSON.stringify({ newPassword })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to change password')

      const user = JSON.parse(localStorage.getItem('portal_user'))
      if (onLogin) onLogin(user, sessionToken)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const containerStyle = {
    minHeight: '100vh',
    backgroundColor: '#0f1117',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: 'Inter, system-ui, sans-serif'
  }

  const cardStyle = {
    backgroundColor: '#1a1d27',
    border: '1px solid #2d3148',
    borderRadius: '16px',
    padding: '40px',
    width: '100%',
    maxWidth: '400px',
    boxShadow: '0 20px 60px rgba(0,0,0,0.4)'
  }

  const inputStyle = {
    width: '100%',
    padding: '10px 14px',
    backgroundColor: '#0f1117',
    border: '1px solid #2d3148',
    borderRadius: '8px',
    color: '#ffffff',
    fontSize: '14px',
    outline: 'none',
    boxSizing: 'border-box',
    fontFamily: 'Inter, system-ui, sans-serif',
    marginBottom: '12px'
  }

  const btnStyle = {
    width: '100%',
    padding: '11px',
    backgroundColor: '#6366f1',
    border: 'none',
    borderRadius: '8px',
    color: '#ffffff',
    fontSize: '14px',
    fontWeight: '700',
    cursor: loading ? 'default' : 'pointer',
    opacity: loading ? 0.7 : 1,
    fontFamily: 'Inter, system-ui, sans-serif',
    marginTop: '4px'
  }

  const labelStyle = {
    display: 'block',
    fontSize: '12px',
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: '6px'
  }

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '32px' }}>
          <div style={{
            width: '36px', height: '36px', borderRadius: '8px',
            backgroundColor: '#6366f1', display: 'flex',
            alignItems: 'center', justifyContent: 'center'
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="7" height="18" rx="1"/>
              <rect x="14" y="3" width="7" height="10" rx="1"/>
            </svg>
          </div>
          <div>
            <p style={{ fontSize: '14px', fontWeight: '700', color: '#ffffff', margin: 0 }}>TIPINC Dev Portal</p>
            <p style={{ fontSize: '11px', color: '#6b7280', margin: 0 }}>Internal access only</p>
          </div>
        </div>

        {/* Login Step */}
        {step === 'login' && (
          <>
            <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#ffffff', margin: '0 0 24px' }}>Sign in</h2>
            <form onSubmit={handleLogin}>
              <label style={labelStyle}>Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@tipinc.com"
                style={inputStyle}
                required
              />
              <label style={labelStyle}>Password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                style={inputStyle}
                required
              />
              {error && <p style={{ fontSize: '12px', color: '#ef4444', marginBottom: '12px' }}>{error}</p>}
              <button type="submit" style={btnStyle} disabled={loading}>
                {loading ? 'Signing in...' : 'Sign in'}
              </button>
            </form>
          </>
        )}

        {/* MFA Step */}
        {step === 'mfa' && (
          <>
            <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#ffffff', margin: '0 0 8px' }}>
              Two-factor authentication
            </h2>
            <p style={{ fontSize: '13px', color: '#6b7280', margin: '0 0 24px' }}>
              Enter the 6-digit code from your authenticator app
            </p>
            <form onSubmit={handleMfa}>
              <input
                type="text"
                value={mfaCode}
                onChange={e => setMfaCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="000000"
                style={{ ...inputStyle, fontSize: '24px', textAlign: 'center', letterSpacing: '0.3em' }}
                maxLength={6}
                required
              />
              {error && <p style={{ fontSize: '12px', color: '#ef4444', marginBottom: '12px' }}>{error}</p>}
              <button type="submit" style={btnStyle} disabled={loading || mfaCode.length !== 6}>
                {loading ? 'Verifying...' : 'Verify'}
              </button>
              <button
                type="button"
                onClick={() => { setStep('login'); setError(null); setMfaCode('') }}
                style={{ ...btnStyle, backgroundColor: 'transparent', border: '1px solid #2d3148', color: '#6b7280', marginTop: '8px' }}
              >
                Back
              </button>
            </form>
          </>
        )}

        {/* Change Password Step */}
        {step === 'change-password' && (
          <>
            <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#ffffff', margin: '0 0 8px' }}>
              Set a new password
            </h2>
            <p style={{ fontSize: '13px', color: '#6b7280', margin: '0 0 24px' }}>
              You must set a new password before continuing
            </p>
            <form onSubmit={handleChangePassword}>
              <label style={labelStyle}>New password</label>
              <input
                type="password"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                placeholder="At least 8 characters"
                style={inputStyle}
                required
              />
              <label style={labelStyle}>Confirm password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                placeholder="Repeat new password"
                style={inputStyle}
                required
              />
              {error && <p style={{ fontSize: '12px', color: '#ef4444', marginBottom: '12px' }}>{error}</p>}
              <button type="submit" style={btnStyle} disabled={loading}>
                {loading ? 'Saving...' : 'Set password & continue'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}