const PRIORITY_COLORS = {
  High: { color: '#dc2626', bg: '#fef2f2' },
  Medium: { color: '#f59e0b', bg: '#fffbeb' },
  Low: { color: '#16a34a', bg: '#f0fdf4' }
}

const CATEGORY_ICONS = {
  'New Feature': '✦',
  'Bug / Fix': '⚠',
  'UI Update': '◈',
  'Stats / Reporting': '▦',
  'Workflow Change': '⟳'
}

export default function RequestCard({ request, onClick }) {
  const priority = PRIORITY_COLORS[request.priority] || PRIORITY_COLORS.Medium

  function formatDate(dateStr) {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <div
      onClick={() => onClick && onClick(request)}
      style={{
        backgroundColor: '#ffffff',
        border: '1px solid #e5e7eb',
        borderRadius: '10px',
        padding: '14px',
        cursor: 'pointer',
        transition: 'box-shadow 0.15s, transform 0.1s',
        boxShadow: '0 1px 3px rgba(0,0,0,0.06)'
      }}
      onMouseEnter={e => {
        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.12)'
        e.currentTarget.style.transform = 'translateY(-1px)'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.06)'
        e.currentTarget.style.transform = 'translateY(0)'
      }}
    >
      {/* Category + Priority */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <span style={{ fontSize: '11px', color: '#6b7280', fontWeight: '500' }}>
          {CATEGORY_ICONS[request.category]} {request.category}
        </span>
        <span style={{
          fontSize: '10px',
          fontWeight: '700',
          padding: '2px 7px',
          borderRadius: '99px',
          backgroundColor: priority.bg,
          color: priority.color
        }}>
          {request.priority}
        </span>
      </div>

      {/* Title */}
      <p style={{
        fontSize: '13px',
        fontWeight: '600',
        color: '#111827',
        margin: '0 0 10px',
        lineHeight: '1.4',
        display: '-webkit-box',
        WebkitLineClamp: 2,
        WebkitBoxOrient: 'vertical',
        overflow: 'hidden'
      }}>
        {request.title}
      </p>

      {/* Footer */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: '10px',
        borderTop: '1px solid #f3f4f6'
      }}>
        <span style={{
          fontSize: '11px',
          color: '#6b7280',
          backgroundColor: '#f9fafb',
          padding: '2px 8px',
          borderRadius: '6px',
          fontWeight: '500'
        }}>
          {request.app_id ? 'TIPConnect' : 'Unknown App'}
        </span>
        <span style={{ fontSize: '11px', color: '#9ca3af' }}>
          {formatDate(request.submitted_at)}
        </span>
      </div>
    </div>
  )
}