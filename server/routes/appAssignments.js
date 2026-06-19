import express from 'express'
import {
  getAssignmentsByUser,
  assignUserToApp,
  removeUserFromApp
} from '../controllers/appAssignments.js'
import { requireAuth } from '../middleware/auth.js'

const router = express.Router()

router.get('/:userId', getAssignmentsByUser)
router.post('/', requireAuth, assignUserToApp)
router.delete('/', requireAuth, removeUserFromApp)

export default router