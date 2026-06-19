import pool from '../utils/db.js'

export async function getAllRoles(req, res) {
  try {
    const result = await pool.query(
      'SELECT * FROM dev_roles ORDER BY created_at DESC'
    )
    res.json(result.rows)
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch roles', detail: err.message })
  }
}

export async function assignRole(req, res) {
  try {
    const { user_id, user_email, user_name, role } = req.body

    if (!user_id || !user_email || !role) {
      return res.status(400).json({ error: 'user_id, user_email, and role are required' })
    }

    const validRoles = ['Developer', 'SeniorDeveloper']
    if (!validRoles.includes(role)) {
      return res.status(400).json({ error: 'Invalid role' })
    }

    // Upsert — update role if user already exists
    const result = await pool.query(
      `INSERT INTO dev_roles (user_id, user_email, user_name, role, assigned_by)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (user_id) DO UPDATE SET role = $4, assigned_by = $5
       RETURNING *`,
      [user_id, user_email, user_name, role, req.body.assigned_by || 'system']
    )

    // Log to audit log
    await pool.query(
      `INSERT INTO audit_log (actor_id, action, target_type, target_id, metadata)
       VALUES ($1, $2, $3, $4, $5)`,
      [
        req.body.assigned_by || 'system',
        'ROLE_ASSIGNED',
        'dev_role',
        user_id,
        JSON.stringify({ user_email, role })
      ]
    )

    res.status(201).json(result.rows[0])
  } catch (err) {
    res.status(500).json({ error: 'Failed to assign role', detail: err.message })
  }
}

export async function removeRole(req, res) {
  try {
    const { userId } = req.params

    const result = await pool.query(
      'DELETE FROM dev_roles WHERE user_id = $1 RETURNING *',
      [userId]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Role not found' })
    }

    // Log to audit log
    await pool.query(
      `INSERT INTO audit_log (actor_id, action, target_type, target_id, metadata)
       VALUES ($1, $2, $3, $4, $5)`,
      [
        'system',
        'ROLE_REMOVED',
        'dev_role',
        userId,
        JSON.stringify({ user_id: userId })
      ]
    )

    res.json({ message: 'Role removed successfully' })
  } catch (err) {
    res.status(500).json({ error: 'Failed to remove role', detail: err.message })
  }
}