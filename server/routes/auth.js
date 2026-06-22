import express from 'express'
import {
  login, verifyMfa, setupMfa, enableMfa,
  getMe, changePassword, logout,
  inviteUser, getAllUsers, resetUserPassword,
  resetUserMfa, deactivateUser
} from '../controllers/auth.js'
import { requirePortalAuth, requireSeniorDev } from '../middleware/portalAuth.js'

const router = express.Router()

// Public
router.post('/login', login)
router.post('/verify-mfa', verifyMfa)

// Authenticated
router.get('/me', requirePortalAuth, getMe)
router.post('/logout', requirePortalAuth, logout)
router.post('/change-password', requirePortalAuth, changePassword)
router.post('/setup-mfa', requirePortalAuth, setupMfa)
router.post('/enable-mfa', requirePortalAuth, enableMfa)

// Senior Dev only
router.get('/users', requirePortalAuth, requireSeniorDev, getAllUsers)
router.post('/users/invite', requirePortalAuth, requireSeniorDev, inviteUser)
router.patch('/users/:userId/reset-password', requirePortalAuth, requireSeniorDev, resetUserPassword)
router.patch('/users/:userId/reset-mfa', requirePortalAuth, requireSeniorDev, resetUserMfa)
router.patch('/users/:userId/deactivate', requirePortalAuth, requireSeniorDev, deactivateUser)

export default router