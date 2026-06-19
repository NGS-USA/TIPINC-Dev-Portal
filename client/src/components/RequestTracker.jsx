import { useState, useEffect, useRef } from 'react'
import { getRequestsByClient } from '../utils/api'

const defaultTheme = {
  primaryColor: '#3b82f6',
  backgroundColor: '#ffffff',
  surfaceColor: '#f9fafb',
  borderColor: '#e5e7eb',
  textColor: '#111827',
  mutedTextColor: '#6b7280',
  fontFamily: 'Inter, system-ui, sans-serif',
  borderRadius: '12px'
}

const STATUS_CONFIG = {
  'Incoming': { label: 'Submitted', color: '#6b7280', bg: '#f3f4f6' },
  'In Review': { label: 'Submitted', color: '#6b7280', bg: '#f3f4f6' },
  'In Progress': { label: 'In Progress', color: '#9333ea', bg: '#faf5ff' },
  'Pending Approval': { label: 'In Progress', color: '#9333ea', bg: '#faf5ff' },
  'Deployed': { label: 'Deployed', color: '#16a34a', bg: '#f0fdf4' },
  'Rejected': { label: 'Rejected', color: '#dc2626', bg: '#fef2f2' }
}

const CATEGORY_ICONS = {
  'New Feature': '✦',
  'Bug / Fix': '⚠',
  'UI Update': '◈',
  'Stats / Reporting': '▦',
  'Workflow Change': '⟳'
}

function StatusBadge({ status }) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG['Incoming']
  return (
    <span style={{
      fontSize: '11px',
      fontWeight: '700',
      padding: '3px 10px',
      borderRadius: '99px',
      backgroundColor: config.bg,
      color: config.color,
      letterSpacing: '0.03em',
      whiteSpace: 'nowrap'
    }}>
      {config.label}
    </span>
  )
}

function RequestCard({ request, theme, previousStatus }) {
  const t = theme
  const [expanded, setExpanded] = useState(false)
  const statusChanged = previousStatus && previousStatus !== request.status
  const isNewStatus = ['In Progress', 'Deployed'].includes(request.status) && statusChanged

  function formatDate(dateStr) {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  return (
    <div
      style={{
        backgroundColor: isNewStatus ? `${t.primaryColor}08` : t.surfaceColor,
        border: `1px solid ${isNewStatus ? t.primaryColor : t.borderColor}`,
        borderRadius: '10px',
        padding: '16px',
        marginBottom: '10px',
        cursor: 'pointer',
        transition: 'box-shadow 0.15s'
      }}
      onClick={() => setExpanded(!expanded)}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span style={{ fontSize: '13px', color: t.mutedTextColor }}>
              {CATEGORY_ICONS[request.category]} {request.category}
            </span>
            {isNewStatus && (
              <span style={{
                fontSize: '10px',
                fontWeight: '700',
                color: t.primaryColor,
                backgroundColor: `${t.primaryColor}15`,
                padding: '1px 6px',
                borderRadius: '99px'
              }}>
                Updated
              </span>
            )}
          </div>
          <p style={{
            fontSize: '14px',
            fontWeight: '600',
            color: t.textColor,
            margin: 0,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: expanded ? 'normal' : 'nowrap'
          }}>
            {request.title}
          </p>
        </div>
        <StatusBadge status={request.status} />
      </div>

      {expanded && (
        <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: `1px solid ${t.borderColor}` }}>
          {request.description && (
            <p style={{ fontSize: '13px', color: t.mutedTextColor, marginBottom: '10px', lineHeight: '1.5' }}>
              {request.description}
            </p>
          )}
          {request.status === 'Rejected' && request.rejection_note && (
            <div style={{
              backgroundColor: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: '8px',
              padding: '10px 12px',
              marginBottom: '10px'
            }}>
              <p style={{ fontSize: '12px', fontWeight: '600', color: '#dc2626', marginBottom: '2px' }}>
                Rejection Note
              </p>
              <p style={{ fontSize: '13px', color: '#dc2626', margin: 0 }}>
                {request.rejection_note}
              </p>
            </div>
          )}
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '12px', color: t.mutedTextColor }}>
              Priority: <strong>{request.priority}</strong>
            </span>
            <span style={{ fontSize: '12px', color: t.mutedTextColor }}>
              {formatDate(request.submitted_at)}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}

export default function RequestTracker({ theme = {}, context = {} }) {
  const t = { ...defaultTheme, ...theme }
  const { clientId } = context

  const [requests, setRequests] = useState([])
  const [previousRequests, setPreviousRequests] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filter, setFilter] = useState('All')
  const [lastUpdated, setLastUpdated] = useState(null)

  const FILTERS = ['All', 'Submitted', 'In Progress', 'Deployed']

  useEffect(() => {
    if (!clientId) return
    fetchRequests()
    const interval = setInterval(fetchRequests, 30000)
    return () => clearInterval(interval)
  }, [clientId])

  async function fetchRequests() {
    try {
      setError(null)
      const data = await getRequestsByClient(clientId)

      // Store previous statuses before updating
      setPreviousRequests(prev => {
        const newPrev = {}
        data.forEach(r => {
          newPrev[r.id] = prev[r.id] || r.status
        })
        return newPrev
      })

      setRequests(data)
      setLastUpdated(new Date())
    } catch (err) {
      setError('Failed to load requests')
    } finally {
      setLoading(false)
    }
  }

  const filtered = requests.filter(r => {
    if (filter === 'All') return true
    const config = STATUS_CONFIG[r.status]
    return config?.label === filter
  })

  function formatLastUpdated(date) {
    if (!date) return ''
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
  }

  const styles = {
    wrapper: {
      backgroundColor: t.backgroundColor,
      fontFamily: t.fontFamily,
      color: t.textColor,
      borderRadius: t.borderRadius,
      padding: '24px',
      maxWidth: '520px',
      width: '100%',
      boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
      boxSizing: 'border-box'
    }
  }

  return (
    <div style={styles.wrapper}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: '700', margin: 0 }}>Your Requests</h2>
          <p style={{ fontSize: '13px', color: t.mutedTextColor, margin: '2px 0 0' }}>
            {requests.length} total request{requests.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={fetchRequests}
          style={{
            fontSize: '12px',
            color: t.primaryColor,
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontFamily: t.fontFamily,
            fontWeight: '600'
          }}
        >
          ↻ Refresh
        </button>
      </div>

      {/* Last Updated */}
      {lastUpdated && (
        <p style={{ fontSize: '11px', color: t.mutedTextColor, marginBottom: '16px' }}>
          Last updated at {formatLastUpdated(lastUpdated)} · auto-refreshes every 30s
        </p>
      )}

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: '6px', marginBottom: '16px', flexWrap: 'wrap' }}>
        {FILTERS.map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              fontSize: '12px',
              fontWeight: '600',
              padding: '5px 12px',
              borderRadius: '99px',
              border: `1.5px solid ${filter === f ? t.primaryColor : t.borderColor}`,
              backgroundColor: filter === f ? `${t.primaryColor}15` : 'transparent',
              color: filter === f ? t.primaryColor : t.mutedTextColor,
              cursor: 'pointer',
              fontFamily: t.fontFamily
            }}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading && (
        <p style={{ textAlign: 'center', color: t.mutedTextColor, fontSize: '14px', padding: '32px 0' }}>
          Loading requests...
        </p>
      )}

      {error && (
        <p style={{ textAlign: 'center', color: '#ef4444', fontSize: '14px', padding: '32px 0' }}>
          {error}
        </p>
      )}

      {!loading && !error && filtered.length === 0 && (
        <div style={{ textAlign: 'center', padding: '32px 0' }}>
          <p style={{ color: t.mutedTextColor, fontSize: '14px' }}>
            {filter === 'All' ? 'No requests submitted yet.' : `No ${filter.toLowerCase()} requests.`}
          </p>
        </div>
      )}

      {!loading && !error && filtered.map(request => (
        <RequestCard
          key={request.id}
          request={request}
          theme={t}
          previousStatus={previousRequests[request.id]}
        />
      ))}
    </div>
  )
}