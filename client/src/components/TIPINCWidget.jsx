import { useState } from 'react'
import RequestForm from './RequestForm'
import RequestTracker from './RequestTracker'
import WhatsNew from './WhatsNew'

export default function TIPINCWidget({ theme = {}, context = {}, defaultTab = 'form' }) {
  const [activeTab, setActiveTab] = useState(defaultTab)

  const t = {
    primaryColor: '#3b82f6',
    backgroundColor: '#ffffff',
    surfaceColor: '#f8fafc',
    borderColor: '#e2e8f0',
    textColor: '#0f172a',
    mutedTextColor: '#64748b',
    fontFamily: 'Inter, system-ui, sans-serif',
    borderRadius: '16px',
    ...theme
  }

  const tabs = [
    { id: 'form', label: 'Submit' },
    { id: 'tracker', label: 'My requests' },
    { id: 'whats-new', label: "What's new" }
  ]

  const sharedTheme = { ...t, borderRadius: '0 0 16px 16px' }

  return (
    <div style={{ fontFamily: t.fontFamily, width: '100%', maxWidth: '520px', boxShadow: '0 4px 24px rgba(0,0,0,0.08)', borderRadius: t.borderRadius }}>
      {/* Tab Bar */}
      <div style={{
        display: 'flex',
        backgroundColor: t.backgroundColor,
        borderRadius: `${t.borderRadius} ${t.borderRadius} 0 0`,
        borderBottom: `1px solid ${t.borderColor}`,
        padding: '0 4px'
      }}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              flex: 1,
              padding: '14px 8px',
              fontSize: '13px',
              fontWeight: activeTab === tab.id ? '700' : '500',
              border: 'none',
              borderBottom: `2px solid ${activeTab === tab.id ? t.primaryColor : 'transparent'}`,
              backgroundColor: 'transparent',
              color: activeTab === tab.id ? t.primaryColor : t.mutedTextColor,
              cursor: 'pointer',
              fontFamily: t.fontFamily,
              transition: 'all 0.15s',
              marginBottom: '-1px'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div>
        {activeTab === 'form' && <RequestForm theme={sharedTheme} context={context} onSubmit={() => setActiveTab('tracker')} />}
        {activeTab === 'tracker' && <RequestTracker theme={sharedTheme} context={context} />}
        {activeTab === 'whats-new' && <WhatsNew theme={sharedTheme} context={context} />}
      </div>
    </div>
  )
}