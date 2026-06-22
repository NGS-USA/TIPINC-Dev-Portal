import pool from '../utils/db.js'

export async function getAnalytics(req, res) {
  try {
    const { app_id } = req.query
    const appFilter = app_id ? `AND app_id = '${app_id}'` : ''

    // Requests by status
    const byStatus = await pool.query(`
      SELECT status, COUNT(*) as count
      FROM requests
      WHERE 1=1 ${appFilter}
      GROUP BY status
      ORDER BY count DESC
    `)

    // Requests by category
    const byCategory = await pool.query(`
      SELECT category, COUNT(*) as count
      FROM requests
      WHERE 1=1 ${appFilter}
      GROUP BY category
      ORDER BY count DESC
    `)

    // Requests by priority
    const byPriority = await pool.query(`
      SELECT priority, COUNT(*) as count
      FROM requests
      WHERE 1=1 ${appFilter}
      GROUP BY priority
      ORDER BY count DESC
    `)

    // Dev workload — how many active requests per dev
    const devWorkload = await pool.query(`
      SELECT 
        assigned_dev_id,
        COUNT(*) as count
      FROM requests
      WHERE assigned_dev_id IS NOT NULL
        AND status NOT IN ('Deployed', 'Rejected')
        ${appFilter}
      GROUP BY assigned_dev_id
      ORDER BY count DESC
    `)

    // Avg resolution time (Incoming to Deployed)
    const avgResolution = await pool.query(`
      SELECT 
        ROUND(AVG(EXTRACT(EPOCH FROM (updated_at - submitted_at)) / 3600)::numeric, 1) as avg_hours
      FROM requests
      WHERE status = 'Deployed'
        ${appFilter}
    `)

    // Requests over time (last 30 days)
    const overTime = await pool.query(`
      SELECT 
        DATE(submitted_at) as date,
        COUNT(*) as count
      FROM requests
      WHERE submitted_at >= NOW() - INTERVAL '30 days'
        ${appFilter}
      GROUP BY DATE(submitted_at)
      ORDER BY date ASC
    `)

    // Total counts
    const totals = await pool.query(`
      SELECT
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE status = 'Incoming') as incoming,
        COUNT(*) FILTER (WHERE status IN ('In Review', 'In Progress')) as active,
        COUNT(*) FILTER (WHERE status = 'Pending Approval') as pending,
        COUNT(*) FILTER (WHERE status = 'Deployed') as deployed
      FROM requests
      WHERE 1=1 ${appFilter}
    `)

    res.json({
      byStatus: byStatus.rows,
      byCategory: byCategory.rows,
      byPriority: byPriority.rows,
      devWorkload: devWorkload.rows,
      avgResolutionHours: parseFloat(avgResolution.rows[0]?.avg_hours) || 0,
      overTime: overTime.rows,
      totals: totals.rows[0]
    })
  } catch (err) {
    console.error('ANALYTICS ERROR:', err.message)
    res.status(500).json({ error: 'Failed to fetch analytics', detail: err.message })
  }
}