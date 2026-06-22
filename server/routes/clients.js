import express from 'express'
import { getAllClients, createClient } from '../controllers/clients.js'

const router = express.Router()

router.get('/', getAllClients)
router.post('/', createClient)

export default router