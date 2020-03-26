const _ = require('lodash')
const MerkleTools = require('merkle-tools')
const config = require('../config')
const badgeTemplateModel = require('../mongoose/models/badge.template')
const certTemplateModel = require('../mongoose/models/certification.template')
const recipientModel = require('../mongoose/models/recipient')
const signatureModel = require('../mongoose/models/signature')
const utils = require('../helpers/utils')
const CONSTANTS = require('../helpers/constants')

const createCertTemplate = async ({
    badgeTemplateId,
    issuedOn,
    displayHtml,
    issuerAddress,
    issuerId,
    name,
    description,
    image,
    criteria,
    signatureLines,
}) => {
    if (!issuerId) throw new Error('issuerId field is missing')
    if (!issuerAddress) throw new Error('issuerAddress field is missing')

    if (!badgeTemplateId) {
        //TODO: verify
        badgeTemplateId = await badgeTemplateModel.create({
            name,
            description,
            image,
            criteria,
            signatureLines,
        })
    }
    const stringData = `${issuerId}:${badgeTemplateId}:${issuerAddress}`
    const _id = utils.toSHA256(stringData)
    const certTemplate = await certTemplateModel.getById(_id)
    if (certTemplate) throw new Error('The certification template is exist')

    const certTemplateId = await certTemplateModel.create({
        _id,
        issuer: issuerId,
        badgeTemplate: badgeTemplateId,
        issuerAddress: issuerAddress.toLowerCase(),
        issuedOn: issuedOn ? issuedOn : utils.createIso8601String(),
        displayHtml,
    })
    return certTemplateId
}

const generateCertTemplate = async certTemplateId => {
    if (!certTemplateId)
        throw new Error('certificationTemplateId field is missing')
    const certTemplate = await certTemplateModel.getByIdAndPopulate(
        certTemplateId,
        [
            'badgeTemplate',
            { path: 'issuer', populate: { path: 'issuerTemplate' } },
        ]
    )
    if (!certTemplate) throw new Error('Certification template is not exist')
    const badgeTemplate = certTemplate.badgeTemplate._doc
    const issuer = certTemplate.issuer._doc
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

    const finalCertTemplate = {
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
        verification: {
            type: [
                CONSTANTS.TYPES.MERKLE_PROOF_VERIFICATION_2017,
                CONSTANTS.TYPES.EXTENSION,
            ],
            publicKey: CONSTANTS.PREFIXS.PUBKEY + certTemplate.issuerAddress,
        },
        issuedOn: certTemplate.issuedOn,
    }
    if (certTemplate.displayHtml) {
        finalCertTemplate['@context'].push(CONSTANTS.CONTEXTS.CUSTOM_CONTEXT)
        finalCertTemplate.displayHtml = certTemplate.displayHtml
    }
    return finalCertTemplate
}

const generateUnsignedCert = (certTemplate, recipient) => {
    const unsignedCert = certTemplate
    unsignedCert.id = CONSTANTS.PREFIXS.URN_UUID + recipient.id
    unsignedCert.recipient = {
        identity: recipient.identity,
        type: CONSTANTS.TYPES.EMAIL,
        hashed: false,
    }
    unsignedCert.recipientProfile = {
        type: [CONSTANTS.TYPES.RECIPIENT_PROFILE, CONSTANTS.TYPES.EXTENSION],
        publicKey: CONSTANTS.PREFIXS.PUBKEY + recipient.publicKey,
        name: recipient.name,
    }
    return unsignedCert
}

const generateMerkleTree = async certTemplateId => {
    if (!certTemplateId) throw new Error('certTemplateId field is missing')
    await recipientModel.updateManyByCondition(
        {
            certTemplateId,
            status: 0,
        },
        { status: 2 }
    )
    const recipients = await recipientModel.getManyByCondition({
        certTemplateId,
        status: 2,
    })
    const signatures = []
    const merkleTools = new MerkleTools()
    for (let i = 0; i < recipients.length; i++) {
        const recipient = recipients[i]
        merkleTools.addLeaf(recipient.hash)
        signatures.push({ targetHash: recipient.hash })
    }
    merkleTools.makeTree(false)
    let merkleRoot
    if (
        merkleTools.getTreeReadyState() &&
        merkleTools.getLeafCount() == signatures.length
    ) {
        merkleRoot = merkleTools.getMerkleRoot().toString('hex')
        _.map(signatures, s => {
            s.merkleRoot = merkleRoot
        })
        for (let i = 0; i < signatures.length; i++) {
            const proof = merkleTools.getProof(i)
            signatures[i].proof = proof
            signatures[i]._id = recipients[i].id
        }
    }
    await signatureModel.createMany(signatures)
    return merkleRoot
}

const updateSourceIdSignature = async ({
    certTemplateId,
    merkleRoot,
    sourceId,
}) => {
    if (!certTemplateId) throw new Error('certTemplateId field is missing')
    if (!merkleRoot) throw new Error('merkleRoot field is missing')
    if (!sourceId) throw new Error('sourceId field is missing')
    sourceId = sourceId.trim()
    await recipientModel.updateManyByCondition(
        { status: 2, certTemplateId },
        { status: 1 }
    )
    const result = await signatureModel.updateManyByCondition(
        { merkleRoot },
        { anchors: { sourceId } }
    )
    return result
}

const generateCertification = async certId => {
    const recipient = await recipientModel.getOneByCondition({
        id: certId,
    })
    if (!recipient) throw new Error('The certification is not exsit')
    const [certTemplate, signature] = await Promise.all([
        generateCertTemplate(recipient.certTemplateId),
        signatureModel.getById(recipient.id),
    ])
    _.map(signature.anchors, e => {
        const anchor = e._doc
        anchor.type = CONSTANTS.TYPES.ETH_DATA
        anchor.chain = CONSTANTS.CHAINS.ETHEREUM_ROPSTEN
        return anchor
    })
    const unsignedCert = generateUnsignedCert(certTemplate, recipient)
    unsignedCert.signature = {
        type: [CONSTANTS.TYPES.MERKLE_PROOF_2017, CONSTANTS.TYPES.EXTENSION],
        ..._.omit(signature, ['_id', 'createdAt', 'updatedAt']),
    }
    return unsignedCert
}

module.exports = {
    createCertTemplate,
    generateCertTemplate,
    generateUnsignedCert,
    generateMerkleTree,
    generateCertification,
    updateSourceIdSignature,
}
