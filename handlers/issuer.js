const _ = require('lodash')
const { v1: uuidv1 } = require('uuid')
const issuerModel = require('../mongoose/models/issuer')
const issuerTemplateModel = require('../mongoose/models/issuer.template')
const revocationModel = require('../mongoose/models/revocation')
const config = require('../config')
const utils = require('../helpers/utils')
const CONSTANTS = require('../helpers/constants')

const createIssuer = async ({
    issuerTemplateId,
    publicKey,
    name,
    email,
    image,
    url,
    description,
    telephone,
}) => {
    //TODO: verify
    publicKey = _.map(publicKey, e => {
        e.created = utils.createIso8601String()
        e.id = e.id.toLowerCase()
        return e
    })
    const _id = uuidv1()

    if (issuerTemplateId) {
        const issuerTemplate = await issuerTemplateModel.getById(
            issuerTemplateId
        )
        if (issuerTemplate) {
        } else {
            throw new Error('Issuer template is not exist')
        }
    } else {
        //TODO: verify
        issuerTemplateId = await issuerTemplateModel.create({
            _id,
            name,
            email,
            image,
            url,
            description,
            telephone,
        })
    }

    const issuerId = await issuerModel.create({
        _id,
        publicKey,
        issuerTemplate: issuerTemplateId,
    })
    return issuerId
}

const generateIssuer = async issuerId => {
    const issuer = await issuerModel.getByIdAndPopulate(issuerId, [
        'issuerTemplate',
    ])
    if (issuer === undefined) throw new Error('The issuer is not exist')
    const issuerTemplate = issuer.issuerTemplate._doc
    issuer.publicKey = _.map(issuer.publicKey, e => {
        e.id = CONSTANTS.PREFIXS.PUBKEY + e.id
        return e
    })
    issuerTemplate.image = CONSTANTS.PREFIXS.PNG + issuerTemplate.image

    const id = `${config.host}/issuers/${issuerId}`
    const revocationList = `${config.host}/issuers/revocationlist/${issuerId}`
    const introductionURL = `${config.host}/issuers/introductionurl/${issuerId}`
    let issuerProfile = {
        '@context': [
            CONSTANTS.CONTEXTS.BLOCKCERTS_V2_CONTEXT_JSON,
            CONSTANTS.CONTEXTS.OPEN_BADGES_V2_CONTEXT_JSON,
        ],
        type: CONSTANTS.TYPES.PROFILE,
        id,
        revocationList,
        introductionURL,
        ..._.omit(issuer, ['_id', 'createdAt', 'updatedAt', 'issuerTemplate']),
        ..._.omit(issuerTemplate, ['_id', 'createdAt', 'updatedAt']),
    }
    return issuerProfile
}

const generateRevocationList = async issuerId => {
    if (!issuerId) throw new Error('issuerId field is missing')
    const issuerInstance = await issuerModel.getById(issuerId)
    if (!issuerInstance) throw new Error('Issuer is not exist')
    let revokedAssertions = await revocationModel.getManyByCondition({
        issuerId,
    })
    revokedAssertions = _.map(revokedAssertions, e => {
        e.id = CONSTANTS.PREFIXS.URN_UUID + e.id
        return _.omit(e, ['_id', 'issuerId', 'createdAt', 'updatedAt'])
    })

    const id = `${config.host}/issuers/revocationlist/${issuerId}`
    const issuer = `${config.host}/issuers/${issuerId}`
    let revocationList = {
        '@context': CONSTANTS.CONTEXTS.OPEN_BADGES_V2_CONTEXT_JSON,
        type: CONSTANTS.TYPES.REVOCATION_LIST,
        id,
        issuer,
        revokedAssertions,
    }
    return revocationList
}

const createRevocation = async (issuerId, { id, revocationReason }) => {
    //TODO: verify
    const [issuer, revocation] = await Promise.all([
        issuerModel.getById(issuerId),
        revocationModel.getOneByCondition({ issuerId, id }),
    ])
    if (issuer === undefined) throw new Error('The issuer is not exist')
    if (revocation !== undefined)
        throw new Error('The certification has been already revoked')
    const revocationId = await revocationModel.create({
        issuerId,
        id,
        revocationReason,
    })
    return revocationId
}

const handleIntroduction = async (issuerId, docs) => {
    console.log(issuerId, docs)
    return ''
}

module.exports = {
    createIssuer,
    createRevocation,
    generateIssuer,
    generateRevocationList,
    handleIntroduction,
}
