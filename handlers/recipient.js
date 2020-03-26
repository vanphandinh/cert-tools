const { v4: uuidv4 } = require('uuid')
const utils = require('../helpers/utils')
const recipientModel = require('../mongoose/models/recipient')
const certTemplateModel = require('../mongoose/models/certification.template')
const {
    generateUnsignedCert,
    generateCertTemplate,
} = require('./certification')

const createRecipient = async ({
    name,
    ethereumAddress,
    email,
    certTemplateId,
}) => {
    //TODO: verify

    const publicKey = ethereumAddress.toLowerCase()
    const stringData = `${name}:${publicKey}:${email}:${certTemplateId}`
    const _id = utils.toSHA256(stringData)
    const recipient = await recipientModel.getById(_id)
    if (recipient)
        throw new Error(
            'The recipient with this certification template is exist'
        )

    const content = {
        id: uuidv4(),
        name,
        publicKey,
        identity: email,
    }

    const certTemplate = await generateCertTemplate(certTemplateId)
    const unsignedCert = generateUnsignedCert(certTemplate, content)
    const hash = await utils.computeHash(unsignedCert)

    const recipientId = await recipientModel.create({
        ...content,
        _id,
        certTemplateId,
        hash,
    })
    return recipientId
}

const getRecipient = async id => {
    const recipient = await recipientModel.getOneByCondition({ id })
    return recipient
}

const getRecipientsByCertTemplateId = async ({ certTemplateId, status }) => {
    if (!certTemplateId) throw new Error('certTemplateId field is missing')
    const certTemplate = await certTemplateModel.getById(certTemplateId)
    if (!certTemplate) throw new Error('Certification template is not exist')
    const query = { certTemplateId }
    if (typeof status === 'number') query.status = status
    const recipients = await recipientModel.getManyByCondition(query)
    return recipients
}

module.exports = {
    createRecipient,
    getRecipient,
    getRecipientsByCertTemplateId,
}
