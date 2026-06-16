import pool from '../utils/db.js'

export async function getAllClients(req, res) {
  try {
    const result = await pool.query(
      'SELECT * FROM clients WHERE is_active = true ORDER BY name ASC'
    )
    res.json(result.rows)
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch clients', detail: err.message })
  }
}

export async function createClient(req, res) {
  try {
    const { name } = req.body
    if (!name) return res.status(400).json({ error: 'Client name is required' })
    const result = await pool.query(
      'INSERT INTO clients (name) VALUES ($1) RETURNING *',
      [name]
    )
    res.status(201).json(result.rows[0])
  } catch (err) {
    res.status(500).json({ error: 'Failed to create client', detail: err.message })
  }
}