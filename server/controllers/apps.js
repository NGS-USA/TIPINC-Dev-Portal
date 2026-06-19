import pool from '../utils/db.js'

export async function getAllApps(req, res) {
  try {
    let result

    if (req.user) {
      // Auth is active — only return apps this user is assigned to
      result = await pool.query(
        `SELECT a.* FROM apps a
         INNER JOIN app_assignments aa ON a.id = aa.app_id
         WHERE aa.user_id = $1 AND a.is_active = true
         ORDER BY a.name ASC`,
        [req.user.id]
      )
    } else {
      // Dev mode — return all apps
      result = await pool.query(
        'SELECT * FROM apps WHERE is_active = true ORDER BY name ASC'
      )
    }

    res.json(result.rows)
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch apps', detail: err.message })
  }
}

export async function getAppById(req, res) {
  try {
    const { id } = req.params

    if (req.user) {
      // Verify user has access to this app
      const access = await pool.query(
        'SELECT * FROM app_assignments WHERE user_id = $1 AND app_id = $2',
        [req.user.id, id]
      )
      if (access.rows.length === 0) {
        return res.status(403).json({ error: 'Access denied to this app' })
      }
    }

    const result = await pool.query('SELECT * FROM apps WHERE id = $1', [id])
    if (result.rows.length === 0) return res.status(404).json({ error: 'App not found' })
    res.json(result.rows[0])
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch app', detail: err.message })
  }
}

export async function createApp(req, res) {
  try {
    const { name, description } = req.body
    if (!name) return res.status(400).json({ error: 'App name is required' })
    const result = await pool.query(
      'INSERT INTO apps (name, description) VALUES ($1, $2) RETURNING *',
      [name, description]
    )
    res.status(201).json(result.rows[0])
  } catch (err) {
    res.status(500).json({ error: 'Failed to create app', detail: err.message })
  }
}