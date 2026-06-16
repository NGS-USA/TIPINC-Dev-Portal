import express from 'express'
import { getChangelogsByApp } from '../controllers/changelogs.js'
import { requireAuth } from '../middleware/auth.js'

const router = express.Router()

router.get('/:appId', requireAuth, getChangelogsByApp)

export default router