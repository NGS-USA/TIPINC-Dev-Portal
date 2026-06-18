import express from 'express'
import {
  getAllRoles,
  assignRole,
  removeRole
} from '../controllers/roles.js'
import { requireAuth } from '../middleware/auth.js'

const router = express.Router()

router.get('/', getAllRoles) // Auth added back when Entra is ready
router.post('/', requireAuth, assignRole)
router.delete('/:userId', requireAuth, removeRole)

export default router