import express from 'express'
import { getAllApps, getAppById, createApp } from '../controllers/apps.js'
import { requireAuth } from '../middleware/auth.js'

const router = express.Router()

router.get('/', requireAuth, getAllApps)
router.get('/:id', requireAuth, getAppById)
router.post('/', requireAuth, createApp)

export default router