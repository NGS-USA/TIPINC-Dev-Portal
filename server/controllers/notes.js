import pool from '../utils/db.js'

export async function getNotes(req, res) {
  try {
    const { requestId } = req.params
    const result = await pool.query(
      'SELECT * FROM request_notes WHERE request_id = $1 ORDER BY created_at ASC',
      [requestId]
    )
    res.json(result.rows)
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch notes', detail: err.message })
  }
}

export async function addNote(req, res) {
  try {
    const { request_id, author_id, author_name, content, is_private, attachments } = req.body
    if (!request_id || !content) {
      return res.status(400).json({ error: 'request_id and content are required' })
    }
    const attachmentData = attachments && Array.isArray(attachments) ? attachments : []
    const result = await pool.query(
      `INSERT INTO request_notes (request_id, author_id, author_name, content, is_private, attachments)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [request_id, author_id || null, author_name || 'Developer', content, is_private || false, JSON.stringify(attachmentData)]
    )
    res.status(201).json(result.rows[0])
  } catch (err) {
    res.status(500).json({ error: 'Failed to add note', detail: err.message })
  }
}

export async function deleteNote(req, res) {
  try {
    const { id } = req.params
    await pool.query('DELETE FROM request_notes WHERE id = $1', [id])
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete note', detail: err.message })
  }
}