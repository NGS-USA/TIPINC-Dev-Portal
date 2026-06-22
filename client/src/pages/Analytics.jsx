import { useState, useEffect } from 'react'
import { getApps } from '../utils/api'

const API = import.meta.env.VITE_API_URL || 'http://localhost:4000'

const STATUS_COLORS = {
  'Incoming': '#6b7280',
  'In Review': '#3b82f6',
  'In Progress': '#9333ea',
  'Pending Approval': '#f59e0b',
  'Deployed': '#16a34a',
  'Rejected': '#ef4444'
}

const PRIORITY_COLORS = {
  'High': '#ef4444',
  'Medium': '#f59e0b',
  'Low': '#22c55e'
}

const CATEGORY_COLORS = {
  'New Feature': '#6366f1',
  'Bug / Fix': '#ef4444',
  'UI Update': '#3b82f6',
  'Stats / Reporting': '#f59e0b',
  'Workflow Change': '#16a34a'
}

function StatCard({ label, value, sub, color = '#6366f1' }) {
  return (
    <div style={{
      backgroundColor: '#1a1d27',
      border: '1px solid #2d3148',
      borderRadius: '12px',
      padding: '20px 24px'
    }}>
      <p style={{ fontSize: '12px', fontWeight: '600', color: '#6b7280', margin: '0 0 8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        {label}
      </p>
      <p style={{ fontSize: '32px', fontWeight: '700', color: '#ffffff', margin: '0 0 4px', lineHeight: 1 }}>
        {value}
      </p>
      {sub && (
        <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>{sub}</p>
      )}
    </div>
  )
}

function BarChart({ data, colorMap, valueKey = 'count', labelKey }) {
  if (!data?.length) return <p style={{ color: '#6b7280', fontSize: '13px' }}>No data yet</p>
  const max = Math.max(...data.map(d => parseInt(d[valueKey])))

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      {data.map(item => {
        const label = item[labelKey]
        const value = parseInt(item[valueKey])
        const pct = max > 0 ? (value / max) * 100 : 0
        const color = colorMap?.[label] || '#6366f1'
        return (
          <div key={label}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span style={{ fontSize: '12px', color: '#9ca3af', fontWeight: '500' }}>{label}</span>
              <span style={{ fontSize: '12px', color: '#ffffff', fontWeight: '700' }}>{value}</span>
            </div>
            <div style={{ height: '6px', backgroundColor: '#2d3148', borderRadius: '99px', overflow: 'hidden' }}>
              <div style={{
                height: '100%',
                width: `${pct}%`,
                backgroundColor: color,
                borderRadius: '99px',
                transition: 'width 0.4s ease'
              }} />
            </div>
          </div>
        )
      })}
    </div>
  )
}

function ActivityChart({ data }) {
  if (!data?.length) return <p style={{ color: '#6b7280', fontSize: '13px' }}>No activity in the last 30 days</p>
  const max = Math.max(...data.map(d => parseInt(d.count)))

  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: '4px', height: '80px' }}>
      {data.map(item => {
        const pct = max > 0 ? (parseInt(item.count) / max) * 100 : 0
        return (
          <div
            key={item.date}
            title={`${new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}: ${item.count} requests`}
            style={{
              flex: 1,
              height: `${Math.max(pct, 4)}%`,
              backgroundColor: '#6366f1',
              borderRadius: '3px 3px 0 0',
              opacity: 0.8,
              cursor: 'default',
              transition: 'opacity 0.15s'
            }}
            onMouseEnter={e => e.currentTarget.style.opacity = '1'}
            onMouseLeave={e => e.currentTarget.style.opacity = '0.8'}
          />
        )
      })}
    </div>
  )
}

export default function Analytics({ selectedApp }) {
  const [data, setData] = useState(null)
  const [apps, setApps] = useState([])
  const [developers, setDevelopers] = useState([])
  const [filterApp, setFilterApp] = useState(selectedApp || 'all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAll()
  }, [filterApp])

  async function fetchAll() {
    try {
      setLoading(true)
      const [appData, analyticsRes, devsRes] = await Promise.all([
        getApps(),
        fetch(`${API}/api/analytics${filterApp !== 'all' ? `?app_id=${filterApp}` : ''}`),
        fetch(`${API}/api/roles`)
      ])
      setApps(appData)
      const analyticsData = await analyticsRes.json()
      setData(analyticsData)
      const devsData = await devsRes.json()
      setDevelopers(devsData)
    } catch (err) {
      console.error('Failed to fetch analytics:', err)
    } finally {
      setLoading(false)
    }
  }

  function getDevName(userId) {
    const dev = developers.find(d => d.user_id === userId)
    return dev?.user_name || dev?.user_email || userId
  }

  return (
    <div style={{
      flex: 1,
      padding: '32px',
      fontFamily: 'Inter, system-ui, sans-serif',
      color: '#ffffff',
      overflowY: 'auto'
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: '700', margin: '0 0 4px' }}>Analytics</h1>
          <p style={{ fontSize: '13px', color: '#6b7280', margin: 0 }}>
            Request volume, status breakdown, and team workload
          </p>
        </div>
        <select
          value={filterApp}
          onChange={e => setFilterApp(e.target.value)}
          style={{
            backgroundColor: '#2d3148',
            border: '1px solid #3d4468',
            borderRadius: '8px',
            color: '#ffffff',
            fontSize: '13px',
            fontWeight: '600',
            padding: '8px 14px',
            cursor: 'pointer',
            outline: 'none'
          }}
        >
          <option value="all">All Apps</option>
          {apps.map(app => (
            <option key={app.id} value={app.id}>{app.name}</option>
          ))}
        </select>
      </div>

      {loading && (
        <p style={{ color: '#6b7280' }}>Loading analytics...</p>
      )}

      {!loading && data && (
        <>
          {/* Stat Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '16px', marginBottom: '28px' }}>
            <StatCard label="Total Requests" value={data.totals?.total || 0} />
            <StatCard label="Incoming" value={data.totals?.incoming || 0} color="#6b7280" />
            <StatCard label="Active" value={data.totals?.active || 0} color="#9333ea" />
            <StatCard label="Pending Approval" value={data.totals?.pending || 0} color="#f59e0b" />
            <StatCard label="Deployed" value={data.totals?.deployed || 0} color="#16a34a" />
          </div>

          {/* Avg Resolution + Activity */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '16px', marginBottom: '28px' }}>
            <div style={{
              backgroundColor: '#1a1d27',
              border: '1px solid #2d3148',
              borderRadius: '12px',
              padding: '20px 24px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center'
            }}>
              <p style={{ fontSize: '12px', fontWeight: '600', color: '#6b7280', margin: '0 0 8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Avg Resolution Time
              </p>
              <p style={{ fontSize: '32px', fontWeight: '700', color: '#ffffff', margin: '0 0 4px', lineHeight: 1 }}>
                {data.avgResolutionHours}h
              </p>
              <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>
                From submission to deployment
              </p>
            </div>

            <div style={{
              backgroundColor: '#1a1d27',
              border: '1px solid #2d3148',
              borderRadius: '12px',
              padding: '20px 24px'
            }}>
              <p style={{ fontSize: '12px', fontWeight: '600', color: '#6b7280', margin: '0 0 16px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Requests — Last 30 Days
              </p>
              <ActivityChart data={data.overTime} />
            </div>
          </div>

          {/* Charts Row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '28px' }}>
            <div style={{ backgroundColor: '#1a1d27', border: '1px solid #2d3148', borderRadius: '12px', padding: '20px 24px' }}>
              <p style={{ fontSize: '12px', fontWeight: '600', color: '#6b7280', margin: '0 0 16px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                By Status
              </p>
              <BarChart data={data.byStatus} colorMap={STATUS_COLORS} labelKey="status" />
            </div>

            <div style={{ backgroundColor: '#1a1d27', border: '1px solid #2d3148', borderRadius: '12px', padding: '20px 24px' }}>
              <p style={{ fontSize: '12px', fontWeight: '600', color: '#6b7280', margin: '0 0 16px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                By Category
              </p>
              <BarChart data={data.byCategory} colorMap={CATEGORY_COLORS} labelKey="category" />
            </div>

            <div style={{ backgroundColor: '#1a1d27', border: '1px solid #2d3148', borderRadius: '12px', padding: '20px 24px' }}>
              <p style={{ fontSize: '12px', fontWeight: '600', color: '#6b7280', margin: '0 0 16px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                By Priority
              </p>
              <BarChart data={data.byPriority} colorMap={PRIORITY_COLORS} labelKey="priority" />
            </div>
          </div>

          {/* Dev Workload */}
          <div style={{ backgroundColor: '#1a1d27', border: '1px solid #2d3148', borderRadius: '12px', padding: '20px 24px' }}>
            <p style={{ fontSize: '12px', fontWeight: '600', color: '#6b7280', margin: '0 0 16px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Developer Workload (Active Requests)
            </p>
            {data.devWorkload?.length === 0 ? (
              <p style={{ color: '#6b7280', fontSize: '13px' }}>No active assignments</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {data.devWorkload?.map(item => {
                  const dev = developers.find(d => d.user_id === item.assigned_dev_id)
                  const max = Math.max(...data.devWorkload.map(d => parseInt(d.count)))
                  const pct = max > 0 ? (parseInt(item.count) / max) * 100 : 0
                  return (
                    <div key={item.assigned_dev_id}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{
                            width: '28px',
                            height: '28px',
                            borderRadius: '50%',
                            backgroundColor: dev?.role === 'SeniorDeveloper' ? '#f59e0b' : '#6366f1',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#fff',
                            fontSize: '12px',
                            fontWeight: '700'
                          }}>
                            {(dev?.user_name || dev?.user_email || item.assigned_dev_id)[0].toUpperCase()}
                          </div>
                          <div>
                            <p style={{ fontSize: '13px', fontWeight: '600', color: '#ffffff', margin: 0 }}>
                              {getDevName(item.assigned_dev_id)}
                            </p>
                            <p style={{ fontSize: '11px', color: '#6b7280', margin: 0 }}>
                              {dev?.role || 'Developer'}
                            </p>
                          </div>
                        </div>
                        <span style={{ fontSize: '13px', fontWeight: '700', color: '#ffffff' }}>
                          {item.count} active
                        </span>
                      </div>
                      <div style={{ height: '6px', backgroundColor: '#2d3148', borderRadius: '99px', overflow: 'hidden' }}>
                        <div style={{
                          height: '100%',
                          width: `${pct}%`,
                          backgroundColor: dev?.role === 'SeniorDeveloper' ? '#f59e0b' : '#6366f1',
                          borderRadius: '99px',
                          transition: 'width 0.4s ease'
                        }} />
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}