import { useState, useEffect } from 'react'
import { getDevelopers, getApps } from '../utils/api'
import { useAuth } from '../context/AuthContext'

const API = import.meta.env.VITE_API_URL || 'http://localhost:4000'

const SECTION_STYLE = {
  backgroundColor: '#1a1d27',
  border: '1px solid #2d3148',
  borderRadius: '12px',
  padding: '24px',
  marginBottom: '24px'
}

const LABEL_STYLE = {
  fontSize: '11px',
  fontWeight: '700',
  color: '#6b7280',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  marginBottom: '16px',
  display: 'block'
}

const INPUT_STYLE = {
  backgroundColor: '#2d3148',
  border: '1px solid #3d4468',
  borderRadius: '8px',
  color: '#ffffff',
  fontSize: '13px',
  padding: '8px 12px',
  outline: 'none',
  fontFamily: 'Inter, system-ui, sans-serif'
}

const BTN_PRIMARY = {
  backgroundColor: '#6366f1',
  border: 'none',
  borderRadius: '8px',
  color: '#ffffff',
  fontSize: '13px',
  fontWeight: '600',
  padding: '8px 16px',
  cursor: 'pointer',
  fontFamily: 'Inter, system-ui, sans-serif'
}

const BTN_DANGER = {
  backgroundColor: 'transparent',
  border: '1px solid #ef444440',
  borderRadius: '8px',
  color: '#ef4444',
  fontSize: '12px',
  fontWeight: '600',
  padding: '5px 10px',
  cursor: 'pointer',
  fontFamily: 'Inter, system-ui, sans-serif'
}

function UserManagement({ authHeader }) {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [inviteForm, setInviteForm] = useState({ email: '', name: '', role: 'Developer' })
  const [inviteResult, setInviteResult] = useState(null)
  const [inviteError, setInviteError] = useState(null)

  useEffect(() => {
    fetchUsers()
  }, [])

  async function fetchUsers() {
    try {
      const res = await fetch(`${API}/api/auth/users`, { headers: authHeader })
      if (!res.ok) return
      const data = await res.json()
      setUsers(data)
    } catch (err) {
      console.error('Failed to fetch users:', err)
    } finally {
      setLoading(false)
    }
  }

  async function handleInvite(e) {
    e.preventDefault()
    setInviteError(null)
    setInviteResult(null)
    try {
      const res = await fetch(`${API}/api/auth/users/invite`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeader },
        body: JSON.stringify(inviteForm)
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setInviteResult(data)
      setInviteForm({ email: '', name: '', role: 'Developer' })
      fetchUsers()
    } catch (err) {
      setInviteError(err.message)
    }
  }

  async function handleResetPassword(userId) {
    if (!window.confirm("Reset this user's password?")) return
    try {
      const res = await fetch(`${API}/api/auth/users/${userId}/reset-password`, {
        method: 'PATCH',
        headers: authHeader
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      alert(`Temporary password: ${data.tempPassword}\n\nShare this with the user — they will be required to change it on next login.`)
    } catch (err) {
      alert('Failed to reset password: ' + err.message)
    }
  }

  async function handleResetMfa(userId) {
    if (!window.confirm('Reset MFA for this user?')) return
    try {
      await fetch(`${API}/api/auth/users/${userId}/reset-mfa`, {
        method: 'PATCH',
        headers: authHeader
      })
      fetchUsers()
    } catch (err) {
      console.error('Failed to reset MFA:', err)
    }
  }

  async function handleDeactivate(userId) {
    if (!window.confirm('Deactivate this user? They will no longer be able to log in.')) return
    try {
      await fetch(`${API}/api/auth/users/${userId}/deactivate`, {
        method: 'PATCH',
        headers: authHeader
      })
      fetchUsers()
    } catch (err) {
      console.error('Failed to deactivate:', err)
    }
  }

  return (
    <div>
      {loading ? (
        <p style={{ fontSize: '13px', color: '#6b7280' }}>Loading users...</p>
      ) : users.length === 0 ? (
        <p style={{ fontSize: '13px', color: '#6b7280', marginBottom: '20px' }}>No portal users yet.</p>
      ) : (
        <div style={{ marginBottom: '24px' }}>
          {users.map(u => (
            <div key={u.id} style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 16px',
              backgroundColor: '#0f1117',
              borderRadius: '8px',
              marginBottom: '8px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '36px', height: '36px', borderRadius: '50%',
                  backgroundColor: u.role === 'SeniorDeveloper' ? '#f59e0b' : '#6366f1',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#fff', fontSize: '14px', fontWeight: '700'
                }}>
                  {(u.name || u.email)[0].toUpperCase()}
                </div>
                <div>
                  <p style={{ fontSize: '13px', fontWeight: '600', color: '#ffffff', margin: 0 }}>
                    {u.name || u.email}
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                    <span style={{ fontSize: '11px', color: '#6b7280' }}>{u.email}</span>
                    <span style={{ fontSize: '10px', color: '#6b7280' }}>·</span>
                    <span style={{
                      fontSize: '11px',
                      color: u.role === 'SeniorDeveloper' ? '#f59e0b' : '#6366f1'
                    }}>
                      {u.role}
                    </span>
                    {u.mfa_enabled && (
                      <>
                        <span style={{ fontSize: '10px', color: '#6b7280' }}>·</span>
                        <span style={{ fontSize: '10px', color: '#16a34a', fontWeight: '700' }}>MFA ✓</span>
                      </>
                    )}
                    {!u.is_active && (
                      <span style={{ fontSize: '10px', color: '#ef4444', fontWeight: '700' }}>Inactive</span>
                    )}
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '6px' }}>
                <button
                  onClick={() => handleResetPassword(u.id)}
                  style={{ ...BTN_DANGER, fontSize: '11px', padding: '4px 8px' }}
                >
                  Reset PW
                </button>
                {u.mfa_enabled && (
                  <button
                    onClick={() => handleResetMfa(u.id)}
                    style={{ ...BTN_DANGER, fontSize: '11px', padding: '4px 8px' }}
                  >
                    Reset MFA
                  </button>
                )}
                {u.is_active && (
                  <button
                    onClick={() => handleDeactivate(u.id)}
                    style={{ ...BTN_DANGER, fontSize: '11px', padding: '4px 8px', borderColor: '#ef444460' }}
                  >
                    Deactivate
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Invite Form */}
      <div style={{ borderTop: '1px solid #2d3148', paddingTop: '20px' }}>
        <p style={{ fontSize: '13px', fontWeight: '600', color: '#9ca3af', marginBottom: '12px' }}>
          Invite New Developer
        </p>
        <form onSubmit={handleInvite}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
            <input
              placeholder="Email"
              value={inviteForm.email}
              onChange={e => setInviteForm(p => ({ ...p, email: e.target.value }))}
              style={{ ...INPUT_STYLE, width: '100%', boxSizing: 'border-box' }}
              required
              type="email"
            />
            <input
              placeholder="Display name"
              value={inviteForm.name}
              onChange={e => setInviteForm(p => ({ ...p, name: e.target.value }))}
              style={{ ...INPUT_STYLE, width: '100%', boxSizing: 'border-box' }}
            />
          </div>
          <select
            value={inviteForm.role}
            onChange={e => setInviteForm(p => ({ ...p, role: e.target.value }))}
            style={{ ...INPUT_STYLE, width: '100%', boxSizing: 'border-box', marginBottom: '10px' }}
          >
            <option value="Developer">Developer</option>
            <option value="SeniorDeveloper">Senior Developer</option>
          </select>
          {inviteError && (
            <p style={{ fontSize: '12px', color: '#ef4444', marginBottom: '8px' }}>{inviteError}</p>
          )}
          {inviteResult && (
            <div style={{
              backgroundColor: '#0f1117',
              border: '1px solid #16a34a40',
              borderRadius: '8px',
              padding: '12px 14px',
              marginBottom: '10px'
            }}>
              <p style={{ fontSize: '12px', color: '#16a34a', fontWeight: '700', margin: '0 0 4px' }}>
                User invited successfully!
              </p>
              <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>
                Temporary password: <code style={{ color: '#6366f1' }}>{inviteResult.tempPassword}</code>
              </p>
              <p style={{ fontSize: '11px', color: '#6b7280', margin: '4px 0 0' }}>
                Share this with the user — they must change it on first login.
              </p>
            </div>
          )}
          <button type="submit" style={BTN_PRIMARY}>Invite Developer</button>
        </form>
      </div>
    </div>
  )
}

export default function Settings() {
  const { portalToken } = useAuth()
  const AUTH_HEADER = portalToken ? { 'Authorization': `Bearer ${portalToken}` } : {}

  const [developers, setDevelopers] = useState([])
  const [apps, setApps] = useState([])
  const [assignments, setAssignments] = useState([])
  const [loading, setLoading] = useState(true)
  const [newDev, setNewDev] = useState({ user_id: '', user_email: '', user_name: '', role: 'Developer' })
  const [devError, setDevError] = useState(null)
  const [devSuccess, setDevSuccess] = useState(false)
  const [newAssignment, setNewAssignment] = useState({ user_id: '', app_id: '' })
  const [assignError, setAssignError] = useState(null)
  const [assignSuccess, setAssignSuccess] = useState(false)

  useEffect(() => {
    fetchAll()
  }, [])

  async function fetchAll() {
    try {
      setLoading(true)
      const [devData, appData] = await Promise.all([getDevelopers(), getApps()])
      setDevelopers(devData)
      setApps(appData)
      await fetchAssignments()
    } catch (err) {
      console.error('Failed to load settings:', err)
    } finally {
      setLoading(false)
    }
  }

  async function fetchAssignments() {
    try {
      const res = await fetch(`${API}/api/app-assignments/all`)
      if (!res.ok) return
      const data = await res.json()
      setAssignments(data)
    } catch (err) {
      console.error('Failed to fetch assignments:', err)
    }
  }

  async function handleAddDev(e) {
    e.preventDefault()
    setDevError(null)
    setDevSuccess(false)
    try {
      const res = await fetch(`${API}/api/roles`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newDev)
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || err.detail || 'Failed to add developer')
      }
      setDevSuccess(true)
      setNewDev({ user_id: '', user_email: '', user_name: '', role: 'Developer' })
      fetchAll()
    } catch (err) {
      setDevError(err.message)
    }
  }

  async function handleRemoveDev(userId) {
    if (!window.confirm('Remove this developer?')) return
    try {
      await fetch(`${API}/api/roles/${userId}`, { method: 'DELETE' })
      fetchAll()
    } catch (err) {
      console.error('Failed to remove developer:', err)
    }
  }

  async function handleUpdateRole(dev, role) {
    try {
      await fetch(`${API}/api/roles`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: dev.user_id,
          user_email: dev.user_email,
          user_name: dev.user_name,
          role,
          assigned_by: 'admin'
        })
      })
      fetchAll()
    } catch (err) {
      console.error('Failed to update role:', err)
    }
  }

  async function handleAddAssignment(e) {
    e.preventDefault()
    setAssignError(null)
    setAssignSuccess(false)
    try {
      const res = await fetch(`${API}/api/app-assignments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newAssignment, assigned_by: 'admin' })
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error)
      }
      setAssignSuccess(true)
      setNewAssignment({ user_id: '', app_id: '' })
      fetchAll()
    } catch (err) {
      setAssignError(err.message)
    }
  }

  async function handleRemoveAssignment(userId, appId) {
    if (!window.confirm('Remove this app access?')) return
    try {
      await fetch(`${API}/api/app-assignments`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, app_id: appId })
      })
      fetchAll()
    } catch (err) {
      console.error('Failed to remove assignment:', err)
    }
  }

  if (loading) {
    return (
      <div style={{ padding: '40px', color: '#6b7280', fontFamily: 'Inter, system-ui, sans-serif' }}>
        Loading settings...
      </div>
    )
  }

  return (
    <div style={{
      flex: 1,
      padding: '32px',
      fontFamily: 'Inter, system-ui, sans-serif',
      color: '#ffffff',
      overflowY: 'auto',
      maxWidth: '800px'
    }}>
      <h1 style={{ fontSize: '22px', fontWeight: '700', margin: '0 0 6px' }}>Settings</h1>
      <p style={{ fontSize: '13px', color: '#6b7280', marginBottom: '32px' }}>
        Manage developer roles and app access. Senior Developer access required.
      </p>

      {/* Developer Roles Section */}
      <div style={SECTION_STYLE}>
        <span style={LABEL_STYLE}>Developer Roles</span>

        {developers.length === 0 ? (
          <p style={{ fontSize: '13px', color: '#6b7280', marginBottom: '20px' }}>
            No developers added yet.
          </p>
        ) : (
          <div style={{ marginBottom: '24px' }}>
            {developers.map(dev => (
              <div key={dev.user_id} style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 16px',
                backgroundColor: '#0f1117',
                borderRadius: '8px',
                marginBottom: '8px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '36px', height: '36px', borderRadius: '50%',
                    backgroundColor: dev.role === 'SeniorDeveloper' ? '#f59e0b' : '#6366f1',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#fff', fontSize: '14px', fontWeight: '700', flexShrink: 0
                  }}>
                    {dev.user_name?.[0] || dev.user_email[0].toUpperCase()}
                  </div>
                  <div>
                    <p style={{ fontSize: '13px', fontWeight: '600', margin: 0, color: '#ffffff' }}>
                      {dev.user_name || dev.user_email}
                    </p>
                    <p style={{ fontSize: '11px', color: '#6b7280', margin: 0 }}>
                      {dev.user_email}
                    </p>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <select
                    value={dev.role}
                    onChange={e => handleUpdateRole(dev, e.target.value)}
                    style={{ ...INPUT_STYLE, fontSize: '12px', padding: '5px 10px' }}
                  >
                    <option value="Developer">Developer</option>
                    <option value="SeniorDeveloper">Senior Developer</option>
                  </select>
                  <button onClick={() => handleRemoveDev(dev.user_id)} style={BTN_DANGER}>
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div style={{ borderTop: '1px solid #2d3148', paddingTop: '20px' }}>
          <p style={{ fontSize: '13px', fontWeight: '600', color: '#9ca3af', marginBottom: '12px' }}>
            Add Developer
          </p>
          <form onSubmit={handleAddDev}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
              <input
                placeholder="User ID (optional)"
                value={newDev.user_id}
                onChange={e => setNewDev(p => ({ ...p, user_id: e.target.value }))}
                style={{ ...INPUT_STYLE, width: '100%', boxSizing: 'border-box' }}
              />
              <input
                placeholder="Email"
                value={newDev.user_email}
                onChange={e => setNewDev(p => ({ ...p, user_email: e.target.value }))}
                style={{ ...INPUT_STYLE, width: '100%', boxSizing: 'border-box' }}
                required
              />
              <input
                placeholder="Display name"
                value={newDev.user_name}
                onChange={e => setNewDev(p => ({ ...p, user_name: e.target.value }))}
                style={{ ...INPUT_STYLE, width: '100%', boxSizing: 'border-box' }}
              />
              <select
                value={newDev.role}
                onChange={e => setNewDev(p => ({ ...p, role: e.target.value }))}
                style={{ ...INPUT_STYLE, width: '100%', boxSizing: 'border-box' }}
              >
                <option value="Developer">Developer</option>
                <option value="SeniorDeveloper">Senior Developer</option>
              </select>
            </div>
            {devError && <p style={{ fontSize: '12px', color: '#ef4444', marginBottom: '8px' }}>{devError}</p>}
            {devSuccess && <p style={{ fontSize: '12px', color: '#22c55e', marginBottom: '8px' }}>Developer added successfully!</p>}
            <button type="submit" style={BTN_PRIMARY}>Add Developer</button>
          </form>
        </div>
      </div>

      {/* App Access Section */}
      <div style={SECTION_STYLE}>
        <span style={LABEL_STYLE}>App Access Assignments</span>
        <p style={{ fontSize: '13px', color: '#6b7280', marginBottom: '20px' }}>
          Control which developers can see and interact with each app.
        </p>

        {apps.map(app => {
          const appAssignments = assignments.filter(a => a.app_id === app.id)
          return (
            <div key={app.id} style={{
              backgroundColor: '#0f1117',
              borderRadius: '8px',
              padding: '16px',
              marginBottom: '12px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <span style={{
                  fontSize: '11px', fontWeight: '700', color: '#6366f1',
                  backgroundColor: '#6366f115', padding: '2px 8px', borderRadius: '4px'
                }}>
                  {app.name}
                </span>
                <span style={{ fontSize: '12px', color: '#6b7280' }}>
                  {appAssignments.length} developer{appAssignments.length !== 1 ? 's' : ''} assigned
                </span>
              </div>

              {appAssignments.length === 0 ? (
                <p style={{ fontSize: '12px', color: '#3d4468', margin: '0 0 8px' }}>
                  No developers assigned to this app yet.
                </p>
              ) : (
                appAssignments.map(a => {
                  const dev = developers.find(d => d.user_id === a.user_id)
                  return (
                    <div key={a.user_id} style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '8px 0', borderBottom: '1px solid #2d3148'
                    }}>
                      <span style={{ fontSize: '13px', color: '#e2e8f0' }}>
                        {dev?.user_name || dev?.user_email || a.user_id}
                      </span>
                      <button onClick={() => handleRemoveAssignment(a.user_id, app.id)} style={BTN_DANGER}>
                        Revoke
                      </button>
                    </div>
                  )
                })
              )}
            </div>
          )
        })}

        <div style={{ borderTop: '1px solid #2d3148', paddingTop: '20px', marginTop: '8px' }}>
          <p style={{ fontSize: '13px', fontWeight: '600', color: '#9ca3af', marginBottom: '12px' }}>
            Grant App Access
          </p>
          <form onSubmit={handleAddAssignment}>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
              <select
                value={newAssignment.user_id}
                onChange={e => setNewAssignment(p => ({ ...p, user_id: e.target.value }))}
                style={{ ...INPUT_STYLE, flex: 1 }}
                required
              >
                <option value="">Select developer...</option>
                {developers.map(dev => (
                  <option key={dev.user_id} value={dev.user_id}>
                    {dev.user_name || dev.user_email}
                  </option>
                ))}
              </select>
              <select
                value={newAssignment.app_id}
                onChange={e => setNewAssignment(p => ({ ...p, app_id: e.target.value }))}
                style={{ ...INPUT_STYLE, flex: 1 }}
                required
              >
                <option value="">Select app...</option>
                {apps.map(app => (
                  <option key={app.id} value={app.id}>{app.name}</option>
                ))}
              </select>
            </div>
            {assignError && <p style={{ fontSize: '12px', color: '#ef4444', marginBottom: '8px' }}>{assignError}</p>}
            {assignSuccess && <p style={{ fontSize: '12px', color: '#22c55e', marginBottom: '8px' }}>Access granted!</p>}
            <button type="submit" style={BTN_PRIMARY}>Grant Access</button>
          </form>
        </div>
      </div>

      {/* User Management Section */}
      <div style={SECTION_STYLE}>
        <span style={LABEL_STYLE}>User Management</span>
        <p style={{ fontSize: '13px', color: '#6b7280', marginBottom: '20px' }}>
          Invite new developers, reset passwords, and manage MFA.
        </p>
        <UserManagement authHeader={AUTH_HEADER} />
      </div>
    </div>
  )
}