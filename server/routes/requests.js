import express from 'express'
import {
  getAllRequests,
  getRequestById,
  createRequest,
  updateRequestStatus
} from '../controllers/requests.js'

const router = express.Router()

router.get('/', getAllRequests)
router.get('/:id', getRequestById)
router.post('/', createRequest)
router.patch('/:id/status', updateRequestStatus)

export default router