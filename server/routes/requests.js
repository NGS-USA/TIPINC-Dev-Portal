import express from 'express'
import {
  getAllRequests,
  getRequestById,
  createRequest,
  updateRequestStatus
} from '../controllers/requests.js'
import { requireAuth } from '../middleware/auth.js'

const router = express.Router()

router.get('/', requireAuth, getAllRequests)
router.get('/:id', requireAuth, getRequestById)
router.post('/', requireAuth, createRequest)
router.patch('/:id/status', requireAuth, updateRequestStatus)

export default router