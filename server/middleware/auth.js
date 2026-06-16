import jwt from 'jsonwebtoken'
import jwksClient from 'jwks-rsa'
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

// Main auth middleware — protects any route it's applied to
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
    (err, decoded) => {
      if (err) {
        return res.status(401).json({ error: 'Invalid or expired token', detail: err.message })
      }

      // Attach user info to the request for use in controllers
      req.user = {
        id: decoded.oid,
        email: decoded.preferred_username,
        name: decoded.name,
        roles: decoded.roles || []
      }

      next()
    }
  )
}

// Role check middleware — use after requireAuth
export function requireRole(role) {
  return (req, res, next) => {
    if (!req.user?.roles?.includes(role)) {
      return res.status(403).json({ error: 'Insufficient permissions' })
    }
    next()
  }
}