import express from 'express'
import {
  getAllRequests, getRequestById, createRequest,
  updateRequestStatus, assignRequest, unassignRequest, deleteRequest
} from '../controllers/requests.js'
import { requireAuth } from '../middleware/auth.js'
import { optionalPortalAuth } from '../middleware/portalAuth.js'

const router = express.Router()

router.get('/', optionalPortalAuth, getAllRequests)
router.get('/:id', getRequestById)
router.post('/', createRequest)
router.patch('/:id/status', updateRequestStatus)
router.patch('/:id/assign', assignRequest)
router.patch('/:id/unassign', unassignRequest)
router.delete('/:id', requireAuth, deleteRequest)

export default router