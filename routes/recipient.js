const express = require('express')
const cors = require('cors')
const recipientHandler = require('../handlers/recipient')
const router = express.Router()

router.post('/', async (req, res) => {
    const body = req.body
    try {
        const id = await recipientHandler.createRecipient(body)
        res.status(201).json({ success: true, result: id })
    } catch (error) {
        console.log(error)
        res.status(500).json({ success: false, error: error.message })
    }
})

router.post('/getall', async (req, res) => {
    const body = req.body
    try {
        const result = await recipientHandler.getRecipientsByCertTemplateId(
            body
        )
        res.status(200).json(result)
    } catch (error) {
        res.status(500).json({ success: false, error: error.message })
    }
})

router.get('/:recipientId', async (req, res) => {
    const id = req.params['recipientId']
    try {
        const result = await recipientHandler.getRecipient(id)
        res.status(200).json(result)
    } catch (error) {
        res.status(500).json({ success: false, error: error.message })
    }
})

module.exports = router
