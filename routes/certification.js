const express = require('express')
const cors = require('cors')
const certificationHandler = require('../handlers/certification')
const router = express.Router()

router.post('/templates/', async (req, res) => {
    const body = req.body
    try {
        const id = await certificationHandler.createCerfiticationTemplate(body)
        res.status(201).json({ success: true, result: id })
    } catch (error) {
        console.log(error)
        res.status(500).json({ success: false, error: error.message })
    }
})

router.get('/templates/:certificationTemplateId', async (req, res) => {
    const id = req.params['certificationTemplateId']
    try {
        const result = await certificationHandler.getCertificationTemplate(id)
        res.status(200).json(result)
    } catch (error) {
        res.status(500).json({ success: false, error: error.message })
    }
})

module.exports = router
