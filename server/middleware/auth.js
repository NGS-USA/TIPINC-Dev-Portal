import jwt from 'jsonwebtoken'
import jwksClient from 'jwks-rsa'
import pool from '../utils/db.js'
import dotenv from 'dotenv'

dotenv.config()

const client = jwksClient({
  jwksUri: `https://login.microsoftonline.com/${process.env.ENTRA_TENANT_ID}/discovery/v2.0/keys`
})

function getSigningKey(header, callback) {
  client.getSigningKey(header.kid, (err, key) => {
    if (err) return callback(err)
    const signingKey = key.getPublicKey()
    callback(null, signingKey)
  })
}

export function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' })
  }

  const token = authHeader.split(' ')[1]

  jwt.verify(
    token,
    getSigningKey,
    {
      audience: process.env.ENTRA_CLIENT_ID,
      issuer: `https://login.microsoftonline.com/${process.env.ENTRA_TENANT_ID}/v2.0`
    },
    async (err, decoded) => {
      if (err) {
        return res.status(401).json({ error: 'Invalid or expired token', detail: err.message })
      }

      // Look up role from database instead of Entra token
      try {
        const roleResult = await pool.query(
          'SELECT role FROM dev_roles WHERE user_id = $1',
          [decoded.oid]
        )

        const role = roleResult.rows[0]?.role || null

        req.user = {
          id: decoded.oid,
          email: decoded.preferred_username,
          name: decoded.name,
          role,
          isDev: role === 'Developer' || role === 'SeniorDeveloper',
          isSeniorDev: role === 'SeniorDeveloper'
        }

        next()
      } catch (dbErr) {
        res.status(500).json({ error: 'Failed to verify user role', detail: dbErr.message })
      }
    }
  )
}

export function requireRole(role) {
  return (req, res, next) => {
    if (role === 'SeniorDeveloper' && !req.user?.isSeniorDev) {
      return res.status(403).json({ error: 'Senior Developer access required' })
    }
    if (role === 'Developer' && !req.user?.isDev) {
      return res.status(403).json({ error: 'Developer access required' })
    }
    next()
  }
}