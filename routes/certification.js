const express = require('express')
const cors = require('cors')
const certificationHandler = require('../handlers/certification')
const router = express.Router()

router.post('/templates', async (req, res) => {
    const body = req.body
    try {
        const id = await certificationHandler.createCertTemplate(body)
        res.status(201).json({ success: true, result: id })
    } catch (error) {
        console.log(error)
        res.status(500).json({ success: false, error: error.message })
    }
})

router.get('/templates/:certificationTemplateId', async (req, res) => {
    const id = req.params['certificationTemplateId']
    try {
        const result = await certificationHandler.generateCertTemplate(id)
        res.status(200).json(result)
    } catch (error) {
        res.status(500).json({ success: false, error: error.message })
    }
})

router.post('/generateMerkleRoot', async (req, res) => {
    const certTemplateId = req.body.certTemplateId
    try {
        const merkleRoot = await certificationHandler.generateMerkleTree(
            certTemplateId
        )
        res.status(201).json({ success: true, result: merkleRoot })
    } catch (error) {
        console.log(error)
        res.status(500).json({ success: false, error: error.message })
    }
})

router.post('/updateSourceId', async (req, res) => {
    const body = req.body
    try {
        await certificationHandler.updateSourceIdSignature(body)
        res.status(201).json({ success: true })
    } catch (error) {
        console.log(error)
        res.status(500).json({ success: false, error: error.message })
    }
})

router.get('/:certId', async (req, res) => {
    const id = req.params['certId']
    try {
        const result = await certificationHandler.generateCertification(id)
        res.status(200).json(result)
    } catch (error) {
        res.status(500).json({ success: false, error: error.message })
    }
})

module.exports = router
