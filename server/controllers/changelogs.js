import pool from '../utils/db.js'

export async function getChangelogsByApp(req, res) {
  try {
    const { appId } = req.params
    const result = await pool.query(
      'SELECT * FROM changelogs WHERE app_id = $1 ORDER BY deployed_at DESC',
      [appId]
    )
    res.json(result.rows)
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch changelogs', detail: err.message })
  }
}