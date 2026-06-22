import pool from '../utils/db.js'

export async function requirePortalAuth(req, res, next) {
  const authHeader = req.headers.authorization
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' })
  }

  const token = authHeader.split(' ')[1]

  try {
    const result = await pool.query(
      `SELECT ps.*, pu.* FROM portal_sessions ps
       JOIN portal_users pu ON ps.user_id = pu.id
       WHERE ps.token = $1 AND ps.expires_at > now() AND pu.is_active = true`,
      [token]
    )

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid or expired session' })
    }

    req.portalUser = result.rows[0]
    next()
  } catch (err) {
    res.status(500).json({ error: 'Auth check failed', detail: err.message })
  }
}

export function requireSeniorDev(req, res, next) {
  if (req.portalUser?.role !== 'SeniorDeveloper') {
    return res.status(403).json({ error: 'Senior Developer access required' })
  }
  next()
}