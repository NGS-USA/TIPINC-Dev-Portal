import express from 'express'
import { getChangelogsByApp } from '../controllers/changelogs.js'

const router = express.Router()

router.get('/:appId', getChangelogsByApp)

export default router