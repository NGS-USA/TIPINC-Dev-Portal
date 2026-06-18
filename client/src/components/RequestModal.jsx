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

export default function RequestModal({ request, onClose }) {
  if (!request) return null

  const priority = PRIORITY_COLORS[request.priority] || PRIORITY_COLORS.Medium

  function formatDate(dateStr) {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          zIndex: 100
        }}
      />

      {/* Modal */}
      <div style={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        padding: '28px',
        width: '100%',
        maxWidth: '500px',
        zIndex: 101,
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        maxHeight: '80vh',
        overflowY: 'auto'
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
          <div style={{ flex: 1, paddingRight: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <span style={{ fontSize: '12px', color: '#6b7280' }}>
                {CATEGORY_ICONS[request.category]} {request.category}
              </span>
              <span style={{
                fontSize: '11px',
                fontWeight: '700',
                padding: '2px 8px',
                borderRadius: '99px',
                backgroundColor: priority.bg,
                color: priority.color
              }}>
                {request.priority}
              </span>
            </div>
            <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#111827', margin: 0 }}>
              {request.title}
            </h2>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '20px',
              color: '#9ca3af',
              cursor: 'pointer',
              padding: '0',
              lineHeight: 1,
              flexShrink: 0
            }}
          >
            ✕
          </button>
        </div>

        {/* Description */}
        {request.description && (
          <div style={{ marginBottom: '20px' }}>
            <p style={{ fontSize: '12px', fontWeight: '600', color: '#6b7280', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Description
            </p>
            <p style={{ fontSize: '14px', color: '#374151', lineHeight: '1.6', margin: 0 }}>
              {request.description}
            </p>
          </div>
        )}

        {/* Rejection Note */}
        {request.rejection_note && (
          <div style={{
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: '10px',
            padding: '14px',
            marginBottom: '20px'
          }}>
            <p style={{ fontSize: '12px', fontWeight: '700', color: '#dc2626', marginBottom: '4px' }}>
              Rejection Note
            </p>
            <p style={{ fontSize: '13px', color: '#dc2626', margin: 0 }}>
              {request.rejection_note}
            </p>
          </div>
        )}

        {/* Details Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '12px',
          backgroundColor: '#f9fafb',
          borderRadius: '10px',
          padding: '16px'
        }}>
          {[
            { label: 'Status', value: request.status },
            { label: 'Priority', value: request.priority },
            { label: 'Submitted', value: formatDate(request.submitted_at) },
            { label: 'Last Updated', value: formatDate(request.updated_at) }
          ].map(({ label, value }) => (
            <div key={label}>
              <p style={{ fontSize: '11px', fontWeight: '600', color: '#9ca3af', margin: '0 0 2px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {label}
              </p>
              <p style={{ fontSize: '13px', color: '#111827', fontWeight: '500', margin: 0 }}>
                {value}
              </p>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}