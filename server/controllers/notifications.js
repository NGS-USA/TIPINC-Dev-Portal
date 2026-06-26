import { sendNotificationEmail } from '../utils/email.js'
import pool from '../utils/db.js'

// Get notifications for a user
export async function getNotifications(req, res) {
  try {
    const { userId } = req.params
    const result = await pool.query(
      `SELECT * FROM notifications 
       WHERE user_id = $1 
       ORDER BY created_at DESC 
       LIMIT 50`,
      [userId]
    )
    const unreadCount = result.rows.filter(n => !n.read).length
    res.json({ notifications: result.rows, unreadCount })
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch notifications', detail: err.message })
  }
}

// Mark a single notification as read
export async function markAsRead(req, res) {
  try {
    const { id } = req.params
    await pool.query(
      'UPDATE notifications SET read = true WHERE id = $1',
      [id]
    )
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: 'Failed to mark notification as read', detail: err.message })
  }
}

// Mark all notifications as read for a user
export async function markAllAsRead(req, res) {
  try {
    const { userId } = req.params
    await pool.query(
      'UPDATE notifications SET read = true WHERE user_id = $1',
      [userId]
    )
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: 'Failed to mark all as read', detail: err.message })
  }
}

// Create a notification (internal use)
export async function createNotification(userId, type, title, message, requestId = null) {
  try {
    await pool.query(
      `INSERT INTO notifications (user_id, type, title, message, request_id)
       VALUES ($1, $2, $3, $4, $5)`,
      [userId, type, title, message, requestId]
    )

    // Look up the user's email to send notification email
    const userResult = await pool.query(
      `SELECT email, name FROM portal_users WHERE id = $1 AND is_active = true`,
      [userId]
    )

    if (userResult.rows.length > 0) {
      const { email, name } = userResult.rows[0]
      await sendNotificationEmail({ to: email, name, title, message, type })
    }
  } catch (err) {
    console.error('Failed to create notification:', err.message)
  }
}

// Delete a notification
export async function deleteNotification(req, res) {
  try {
    const { id } = req.params
    await pool.query('DELETE FROM notifications WHERE id = $1', [id])
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete notification', detail: err.message })
  }
}