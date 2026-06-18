import express from 'express'
import {
  getAllRequests,
  getRequestById,
  createRequest,
  updateRequestStatus
} from '../controllers/requests.js'
import { requireAuth } from '../middleware/auth.js'

const router = express.Router()

router.get('/', getAllRequests) // Auth added back when Entra is ready
router.get('/:id', getRequestById) // Auth added back when Entra is ready
router.post('/', createRequest) // Auth added back when Entra is ready
router.patch('/:id/status', requireAuth, updateRequestStatus)

export default router