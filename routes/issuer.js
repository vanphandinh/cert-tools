const express = require('express')
const cors = require('cors')
const issuerHandler = require('../handlers/issuer')
const router = express.Router()

router.post('/', async (req, res) => {
    const body = req.body
    try {
        const id = await issuerHandler.createIssuer(body)
        res.status(201).json({ success: true, result: id })
    } catch (error) {
        res.status(500).json({ success: false, error: error.message })
    }
})

router.get('/revocationlist/:issuerId', cors(), async (req, res) => {
    const issuerId = req.params['issuerId']
    try {
        const result = await issuerHandler.generateRevocationList(issuerId)
        res.status(200).json(result)
    } catch (error) {
        res.status(500).json({ success: false, error: error.message })
    }
})

router.post('/revocationlist/:issuerId', async (req, res) => {
    const issuerId = req.params['issuerId']
    const body = req.body
    try {
        const id = await issuerHandler.createRevocation(issuerId, body)
        res.status(201).json({ success: true, result: id })
    } catch (error) {
        res.status(500).json({ success: false, error: error.message })
    }
})

router.post('/introductionurl/:issuerId', async (req, res) => {
    const issuerId = req.params['issuerId']
    const body = req.body
    try {
        const id = await issuerHandler.handleIntroduction(issuerId, body)
        res.status(200).json({ success: true, result: id })
    } catch (error) {
        res.status(500).json({ success: false, error: error.message })
    }
})

router.get('/:issuerId', cors(), async (req, res) => {
    const issuerId = req.params['issuerId']
    try {
        const result = await issuerHandler.generateIssuer(issuerId)
        res.status(200).json(result)
    } catch (error) {
        res.status(500).json({ success: false, error: error.message })
    }
})

module.exports = router
