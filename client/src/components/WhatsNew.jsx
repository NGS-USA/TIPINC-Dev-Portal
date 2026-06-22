import { useState, useEffect } from 'react'
import { getChangelogsByApp } from '../utils/api'

const defaultTheme = {
  primaryColor: '#3b82f6',
  backgroundColor: '#ffffff',
  surfaceColor: '#f8fafc',
  borderColor: '#e2e8f0',
  textColor: '#0f172a',
  mutedTextColor: '#64748b',
  fontFamily: 'Inter, system-ui, sans-serif',
  borderRadius: '16px'
}

export default function WhatsNew({ theme = {}, context = {} }) {
  const t = { ...defaultTheme, ...theme }
  const { appId, appName } = context
  const [changelogs, setChangelogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [expanded, setExpanded] = useState(null)

  useEffect(() => {
    if (!appId) return
    fetchChangelogs()
  }, [appId])

  async function fetchChangelogs() {
    try {
      setLoading(true)
      setError(null)
      const data = await getChangelogsByApp(appId)
      setChangelogs(data)
      if (data.length > 0) setExpanded(data[0].id)
    } catch {
      setError('Failed to load updates')
    } finally {
      setLoading(false)
    }
  }

  function formatDate(d) {
    return new Date(d).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
  }

  return (
    <div style={{ backgroundColor: t.backgroundColor, fontFamily: t.fontFamily, borderRadius: t.borderRadius, padding: '24px', maxWidth: '520px', width: '100%', boxSizing: 'border-box' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: '700', color: t.textColor, margin: '0 0 2px' }}>What's new</h2>
          <p style={{ fontSize: '12px', color: t.mutedTextColor, margin: 0 }}>
            {appName ? `Latest updates for ${appName}` : 'Latest updates'}
          </p>
        </div>
        <button onClick={fetchChangelogs} style={{ fontSize: '12px', color: t.primaryColor, background: 'none', border: 'none', cursor: 'pointer', fontFamily: t.fontFamily, fontWeight: '600', padding: 0 }}>
          ↻ Refresh
        </button>
      </div>

      {loading && <p style={{ textAlign: 'center', color: t.mutedTextColor, padding: '24px 0', fontSize: '14px' }}>Loading updates...</p>}
      {error && <p style={{ textAlign: 'center', color: '#ef4444', padding: '24px 0', fontSize: '14px' }}>{error}</p>}

      {!loading && !error && changelogs.length === 0 && (
        <div style={{ textAlign: 'center', padding: '32px 0' }}>
          <p style={{ fontSize: '28px', margin: '0 0 8px' }}>🎉</p>
          <p style={{ color: t.mutedTextColor, fontSize: '14px', margin: 0 }}>No updates yet — check back soon!</p>
        </div>
      )}

      {!loading && !error && changelogs.map((entry, index) => (
        <div key={entry.id} style={{ marginBottom: index < changelogs.length - 1 ? '4px' : 0 }}>
          <div
            onClick={() => setExpanded(expanded === entry.id ? null : entry.id)}
            style={{
              padding: '16px',
              borderRadius: expanded === entry.id ? '12px 12px 0 0' : '12px',
              border: `1px solid ${expanded === entry.id ? t.primaryColor + '40' : t.borderColor}`,
              backgroundColor: expanded === entry.id ? `${t.primaryColor}05` : t.surfaceColor,
              cursor: 'pointer',
              transition: 'all 0.15s'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{
                  fontSize: '12px', fontWeight: '700', color: t.primaryColor,
                  backgroundColor: `${t.primaryColor}15`, padding: '3px 10px',
                  borderRadius: '99px', fontFamily: 'monospace'
                }}>
                  {entry.version}
                </span>
                {index === 0 && (
                  <span style={{ fontSize: '10px', fontWeight: '700', color: '#16a34a', backgroundColor: '#f0fdf4', padding: '2px 8px', borderRadius: '99px' }}>
                    Latest
                  </span>
                )}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '12px', color: t.mutedTextColor }}>{formatDate(entry.deployed_at)}</span>
                <span style={{ fontSize: '12px', color: t.mutedTextColor }}>{expanded === entry.id ? '▲' : '▼'}</span>
              </div>
            </div>
            {expanded !== entry.id && (
              <p style={{ fontSize: '13px', color: t.mutedTextColor, margin: '8px 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {entry.client_summary}
              </p>
            )}
          </div>

          {expanded === entry.id && (
            <div style={{
              padding: '16px',
              border: `1px solid ${t.primaryColor + '40'}`,
              borderTop: 'none',
              borderRadius: '0 0 12px 12px',
              backgroundColor: t.backgroundColor
            }}>
              <p style={{ fontSize: '14px', color: t.textColor, lineHeight: '1.6', margin: 0 }}>
                {entry.client_summary}
              </p>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}