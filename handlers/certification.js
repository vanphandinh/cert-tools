const _ = require('lodash')
const { v1: uuidv1 } = require('uuid')
const config = require('../config')
const badgeTemplateModel = require('../mongoose/models/badge.template')
const issuerModel = require('../mongoose/models/issuer')
const certificationTemplateModel = require('../mongoose/models/certification.template')
const CONSTANTS = require('../helpers/constants')

const createCerfiticationTemplate = async docs => {
    let badgeTemplateId = docs.badgeTemplateId
    const issuerId = docs.issuerId
    if (!issuerId) throw new Error('issuerId field is missing')
    const issuer = await issuerModel.getById(issuerId)
    if (!issuer) throw new Error('Issuer is not exist')
    if (!badgeTemplateId) {
        const { name, description, image, criteria, signatureLines } = docs
        badgeTemplateId = await badgeTemplateModel.create({
            name,
            description,
            image,
            criteria,
            signatureLines,
        })
    }
    const certificationTemplateId = await certificationTemplateModel.create({
        issuer: issuerId,
        badgeTemplate: badgeTemplateId,
    })
    return certificationTemplateId
}

const getCertificationTemplate = async certTemplateId => {
    if (!certTemplateId)
        throw new Error('certificationTemplateId field is missing')
    const certificationTemplate = await certificationTemplateModel.getByIdAndPopulate(
        certTemplateId,
        [
            'badgeTemplate',
            { path: 'issuer', populate: { path: 'issuerTemplate' } },
        ]
    )
    const badgeTemplate = certificationTemplate.badgeTemplate._doc
    const issuer = certificationTemplate.issuer._doc
    const issuerTemplate = issuer.issuerTemplate._doc

    const id = `${config.host}/issuers/${issuer._id}`
    const revocationList = `${config.host}/issuers/revocationlist/${issuer._id}`

    issuerTemplate.image = CONSTANTS.PREFIXS.PNG + issuerTemplate.image
    badgeTemplate.image = CONSTANTS.PREFIXS.PNG + badgeTemplate.image
    badgeTemplate.signatureLines = _.map(badgeTemplate.signatureLines, e => {
        const eDoc = e._doc
        eDoc.type = [CONSTANTS.TYPES.SIGNATURE_LINE, CONSTANTS.TYPES.EXTENSION]
        eDoc.image = CONSTANTS.PREFIXS.PNG + e.image
        return eDoc
    })
    badgeTemplate.id = CONSTANTS.PREFIXS.URN_UUID + badgeTemplate._id

    const finalCertificationTemplate = {
        '@context': [
            CONSTANTS.CONTEXTS.BLOCKCERTS_V2_CONTEXT_JSON,
            CONSTANTS.CONTEXTS.OPEN_BADGES_V2_CONTEXT_JSON,
        ],
        type: CONSTANTS.TYPES.CERTIFICATION,
        badge: {
            type: CONSTANTS.TYPES.BADGE,
            issuer: {
                id,
                revocationList,
                type: CONSTANTS.TYPES.PROFILE,
                ..._.omit(issuerTemplate, ['createdAt', 'updatedAt', '_id']),
            },
            ..._.omit(badgeTemplate, ['createdAt', 'updatedAt', '_id']),
        },
    }
    return finalCertificationTemplate
}

module.exports = {
    createCerfiticationTemplate,
    getCertificationTemplate,
}
