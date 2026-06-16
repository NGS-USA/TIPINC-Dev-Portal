import express from 'express'
import { getAllApps, getAppById, createApp } from '../controllers/apps.js'

const router = express.Router()

router.get('/', getAllApps)
router.get('/:id', getAppById)
router.post('/', createApp)

export default router