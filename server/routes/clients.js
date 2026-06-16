import express from 'express'
import { getAllClients, createClient } from '../controllers/clients.js'
import { requireAuth } from '../middleware/auth.js'

const router = express.Router()

router.get('/', requireAuth, getAllClients)
router.post('/', requireAuth, createClient)

export default router