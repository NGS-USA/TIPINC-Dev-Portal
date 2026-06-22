import { useState } from 'react'
import { submitRequest } from '../utils/api'

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

const CATEGORIES = [
  { value: 'New Feature', icon: '✦', description: 'Request a new capability' },
  { value: 'Bug / Fix', icon: '⚠', description: 'Something is broken' },
  { value: 'UI Update', icon: '◈', description: 'Visual or layout change' },
  { value: 'Stats / Reporting', icon: '▦', description: 'Data or reporting need' },
  { value: 'Workflow Change', icon: '⟳', description: 'Process improvement' }
]

const PRIORITIES = [
  { value: 'Low', color: '#22c55e', bg: '#f0fdf4', border: '#bbf7d0', description: 'When you get a chance' },
  { value: 'Medium', color: '#f59e0b', bg: '#fffbeb', border: '#fde68a', description: 'Fairly soon' },
  { value: 'High', color: '#ef4444', bg: '#fef2f2', border: '#fecaca', description: 'Urgent' }
]

export default function RequestForm({ theme = {}, context = {}, onSubmit }) {
  const t = { ...defaultTheme, ...theme }

  const { appId, clientId, locationId, userId, appName, clientName } = context

  const [form, setForm] = useState({ category: '', priority: 'Medium', title: '', description: '' })
  const [errors, setErrors] = useState({})
  const [submitted, setSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState(null)
  const [contextError, setContextError] = useState(false)

  function validate() {
    const e = {}
    if (!form.category) e.category = 'Please select a category'
    if (!form.title.trim()) e.title = 'Please enter a title'
    return e
  }

  function handleChange(e) {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
    setErrors(prev => ({ ...prev, [name]: undefined }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!appId || !clientId) { setContextError(true); return }
    const v = validate()
    if (Object.keys(v).length > 0) { setErrors(v); return }
    setIsSubmitting(true)
    try {
      await submitRequest({ ...form, app_id: appId, client_id: clientId, location_id: locationId || null, user_id: userId || null })
      setSubmitted(true)
      if (onSubmit) onSubmit()
    } catch (err) {
      setSubmitError(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  function handleReset() {
    setForm({ category: '', priority: 'Medium', title: '', description: '' })
    setErrors({})
    setSubmitted(false)
    setContextError(false)
    setSubmitError(null)
  }

  if (contextError) return (
    <div style={{ backgroundColor: t.backgroundColor, fontFamily: t.fontFamily, borderRadius: t.borderRadius, padding: '32px', maxWidth: '520px', width: '100%', boxSizing: 'border-box', textAlign: 'center' }}>
      <p style={{ color: '#ef4444', fontWeight: '700', fontSize: '14px', marginBottom: '8px' }}>Configuration Error</p>
      <p style={{ color: t.mutedTextColor, fontSize: '13px', marginBottom: '20px' }}>Missing required context. Check widget configuration.</p>
      <button onClick={handleReset} style={{ padding: '8px 20px', backgroundColor: '#ef4444', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontFamily: t.fontFamily, fontWeight: '600' }}>Dismiss</button>
    </div>
  )

  if (submitted) return (
    <div style={{ backgroundColor: t.backgroundColor, fontFamily: t.fontFamily, borderRadius: t.borderRadius, padding: '40px 32px', maxWidth: '520px', width: '100%', boxSizing: 'border-box', textAlign: 'center' }}>
      <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: `${t.primaryColor}15`, border: `2px solid ${t.primaryColor}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M5 13l4 4L19 7" stroke={t.primaryColor} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
      <h2 style={{ fontSize: '20px', fontWeight: '700', color: t.textColor, margin: '0 0 8px' }}>Request submitted</h2>
      <p style={{ fontSize: '14px', color: t.mutedTextColor, margin: '0 0 28px', lineHeight: '1.5' }}>
        We've received your request and will keep you updated as it progresses.
      </p>
      <button onClick={handleReset} style={{ padding: '10px 24px', backgroundColor: t.primaryColor, color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontFamily: t.fontFamily, fontWeight: '600', fontSize: '14px' }}>
        Submit another
      </button>
    </div>
  )

  return (
    <div style={{ backgroundColor: t.backgroundColor, fontFamily: t.fontFamily, borderRadius: t.borderRadius, padding: '28px', maxWidth: '520px', width: '100%', boxSizing: 'border-box' }}>

      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: '700', color: t.textColor, margin: '0 0 4px' }}>Submit a request</h2>
        <p style={{ fontSize: '13px', color: t.mutedTextColor, margin: 0 }}>
          {appName && clientName ? `${clientName} · ${appName}` : 'Tell us what you need'}
        </p>
      </div>

      <form onSubmit={handleSubmit} noValidate>

        {/* Category */}
        <div style={{ marginBottom: '22px' }}>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: t.textColor, marginBottom: '10px' }}>
            What type of request is this? <span style={{ color: '#ef4444' }}>*</span>
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            {CATEGORIES.map(cat => (
              <div
                key={cat.value}
                onClick={() => { setForm(p => ({ ...p, category: cat.value })); setErrors(p => ({ ...p, category: undefined })) }}
                style={{
                  padding: '12px 14px',
                  borderRadius: '10px',
                  border: `1.5px solid ${form.category === cat.value ? t.primaryColor : t.borderColor}`,
                  backgroundColor: form.category === cat.value ? `${t.primaryColor}08` : t.surfaceColor,
                  cursor: 'pointer',
                  transition: 'all 0.15s'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                  <span style={{ fontSize: '14px', color: form.category === cat.value ? t.primaryColor : t.mutedTextColor }}>
                    {cat.icon}
                  </span>
                  <span style={{ fontSize: '12px', fontWeight: '700', color: form.category === cat.value ? t.primaryColor : t.textColor }}>
                    {cat.value}
                  </span>
                </div>
                <p style={{ fontSize: '11px', color: t.mutedTextColor, margin: 0, lineHeight: '1.3' }}>
                  {cat.description}
                </p>
              </div>
            ))}
          </div>
          {errors.category && <p style={{ fontSize: '12px', color: '#ef4444', marginTop: '6px' }}>{errors.category}</p>}
        </div>

        {/* Priority */}
        <div style={{ marginBottom: '22px' }}>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: t.textColor, marginBottom: '10px' }}>
            How urgent is this?
          </label>
          <div style={{ display: 'flex', gap: '8px' }}>
            {PRIORITIES.map(p => (
              <div
                key={p.value}
                onClick={() => setForm(prev => ({ ...prev, priority: p.value }))}
                style={{
                  flex: 1,
                  padding: '10px 12px',
                  borderRadius: '10px',
                  border: `1.5px solid ${form.priority === p.value ? p.color : t.borderColor}`,
                  backgroundColor: form.priority === p.value ? p.bg : t.surfaceColor,
                  cursor: 'pointer',
                  textAlign: 'center',
                  transition: 'all 0.15s'
                }}
              >
                <div style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: p.color,
                  margin: '0 auto 6px'
                }} />
                <p style={{ fontSize: '12px', fontWeight: '700', color: form.priority === p.value ? p.color : t.textColor, margin: '0 0 2px' }}>
                  {p.value}
                </p>
                <p style={{ fontSize: '10px', color: t.mutedTextColor, margin: 0 }}>
                  {p.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Title */}
        <div style={{ marginBottom: '22px' }}>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: t.textColor, marginBottom: '8px' }}>
            Title <span style={{ color: '#ef4444' }}>*</span>
          </label>
          <input
            type="text"
            name="title"
            value={form.title}
            onChange={handleChange}
            placeholder="Brief summary of your request"
            style={{
              width: '100%',
              padding: '10px 14px',
              fontSize: '14px',
              backgroundColor: t.surfaceColor,
              border: `1.5px solid ${errors.title ? '#ef4444' : t.borderColor}`,
              borderRadius: '10px',
              color: t.textColor,
              outline: 'none',
              boxSizing: 'border-box',
              fontFamily: t.fontFamily,
              transition: 'border-color 0.15s'
            }}
            onFocus={e => e.target.style.borderColor = t.primaryColor}
            onBlur={e => e.target.style.borderColor = errors.title ? '#ef4444' : t.borderColor}
          />
          {errors.title && <p style={{ fontSize: '12px', color: '#ef4444', marginTop: '6px' }}>{errors.title}</p>}
        </div>

        {/* Description */}
        <div style={{ marginBottom: '24px' }}>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: t.textColor, marginBottom: '8px' }}>
            Details <span style={{ fontSize: '12px', fontWeight: '400', color: t.mutedTextColor }}>(optional)</span>
          </label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="The more detail you provide, the faster we can help..."
            rows={4}
            style={{
              width: '100%',
              padding: '10px 14px',
              fontSize: '13px',
              backgroundColor: t.surfaceColor,
              border: `1.5px solid ${t.borderColor}`,
              borderRadius: '10px',
              color: t.textColor,
              outline: 'none',
              boxSizing: 'border-box',
              fontFamily: t.fontFamily,
              resize: 'vertical',
              lineHeight: '1.5',
              transition: 'border-color 0.15s'
            }}
            onFocus={e => e.target.style.borderColor = t.primaryColor}
            onBlur={e => e.target.style.borderColor = t.borderColor}
          />
        </div>

        {submitError && (
          <p style={{ fontSize: '12px', color: '#ef4444', marginBottom: '12px', textAlign: 'center' }}>
            {submitError}
          </p>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          style={{
            width: '100%',
            padding: '12px',
            backgroundColor: t.primaryColor,
            color: '#ffffff',
            fontSize: '14px',
            fontWeight: '700',
            border: 'none',
            borderRadius: '10px',
            cursor: isSubmitting ? 'default' : 'pointer',
            fontFamily: t.fontFamily,
            opacity: isSubmitting ? 0.7 : 1,
            transition: 'opacity 0.15s'
          }}
        >
          {isSubmitting ? 'Submitting...' : 'Submit request'}
        </button>
      </form>
    </div>
  )
}